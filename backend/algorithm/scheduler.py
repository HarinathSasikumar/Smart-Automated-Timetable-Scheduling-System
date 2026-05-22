"""
Smart Timetable Scheduling — Genetic Algorithm Engine
======================================================
Chromosome: list of Gene objects
Gene: (batch_id, subject_id, faculty_id, room_id, day, slot)
Fitness: penalizes hard violations, rewards soft compliance
"""

import random
import copy
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple
import itertools

DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"]
SLOTS = [1, 2, 3, 4, 5, 6]  # 6 periods per day

# Slot timing map for display
SLOT_TIMES = {
    1: "08:30 - 09:20",
    2: "09:20 - 10:10",
    3: "10:10 - 11:00",
    4: "11:15 - 12:05",  # after break
    5: "12:05 - 12:55",
    6: "01:40 - 02:30",  # after lunch
}

BREAK_SLOT = 3.5   # conceptual break after slot 3
LUNCH_SLOT = 5.5   # conceptual lunch after slot 5


@dataclass
class Gene:
    batch_id: str
    subject_id: str
    faculty_id: str
    room_id: str
    day: str
    slot: int
    is_lab: bool = False


@dataclass
class Chromosome:
    genes: List[Gene] = field(default_factory=list)
    fitness: float = 0.0


class GeneticScheduler:
    def __init__(
        self,
        batches: List[Dict],
        subjects: Dict[str, Dict],   # id -> subject doc
        faculties: Dict[str, Dict],  # id -> faculty doc
        rooms: List[Dict],
        population_size: int = 50,
        generations: int = 200,
        mutation_rate: float = 0.05,
        elite_size: int = 10,
    ):
        self.batches = batches
        self.subjects = subjects
        self.faculties = faculties
        self.rooms = rooms
        self.rooms_by_id = {str(r["_id"]): r for r in rooms}
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.elite_size = elite_size
        self.room_ids = [str(r["_id"]) for r in rooms]
        self.classroom_ids = [str(r["_id"]) for r in rooms if r.get("type") == "classroom"]
        self.lab_ids = [str(r["_id"]) for r in rooms if r.get("type") == "lab"]

    # ------------------------------------------------------------------ #
    #  CHROMOSOME INITIALIZATION                                           #
    # ------------------------------------------------------------------ #
    def _random_chromosome(self) -> Chromosome:
        """Build one random valid-ish chromosome."""
        genes: List[Gene] = []
        for batch in self.batches:
            batch_id = str(batch["_id"])
            for bs in batch.get("subjects", []):
                subj_id = bs["subject_id"]
                faculty_id = bs["faculty_id"]
                subj = self.subjects.get(subj_id, {})
                is_lab = subj.get("is_lab", False)
                weekly_hours = subj.get("weekly_hours", 3)

                available_slots = self._available_slots_for_faculty(faculty_id)
                random.shuffle(available_slots)

                hours_placed = 0
                for day, slot in available_slots:
                    if hours_placed >= weekly_hours:
                        break
                    room_pool = self.lab_ids if is_lab else self.classroom_ids
                    if not room_pool:
                        room_pool = self.room_ids
                    room_id = random.choice(room_pool) if room_pool else ""
                    genes.append(Gene(
                        batch_id=batch_id,
                        subject_id=subj_id,
                        faculty_id=faculty_id,
                        room_id=room_id,
                        day=day,
                        slot=slot,
                        is_lab=is_lab,
                    ))
                    hours_placed += 1

        return Chromosome(genes=genes)

    def _available_slots_for_faculty(self, faculty_id: str) -> List[Tuple[str, int]]:
        faculty = self.faculties.get(faculty_id, {})
        availability = faculty.get("availability", {d: list(range(1, 7)) for d in DAYS})
        slots = []
        for day, slot_list in availability.items():
            for s in slot_list:
                slots.append((day, s))
        return slots

    # ------------------------------------------------------------------ #
    #  FITNESS FUNCTION                                                    #
    # ------------------------------------------------------------------ #
    def _fitness(self, chrom: Chromosome) -> float:
        score = 1000.0

        # Build lookup: (faculty_id, day, slot) -> count (hard: faculty conflict)
        faculty_slot: Dict[Tuple, int] = {}
        # Build lookup: (room_id, day, slot) -> count (hard: room conflict)
        room_slot: Dict[Tuple, int] = {}
        # Build lookup: (batch_id, day, slot) -> count (hard: batch double book)
        batch_slot: Dict[Tuple, int] = {}

        # Soft: per-batch day subject list for clustering check
        batch_day_subjects: Dict[Tuple[str, str], List[str]] = {}

        for gene in chrom.genes:
            fk = (gene.faculty_id, gene.day, gene.slot)
            rk = (gene.room_id, gene.day, gene.slot)
            bk = (gene.batch_id, gene.day, gene.slot)
            bds_key = (gene.batch_id, gene.day)

            faculty_slot[fk] = faculty_slot.get(fk, 0) + 1
            room_slot[rk] = room_slot.get(rk, 0) + 1
            batch_slot[bk] = batch_slot.get(bk, 0) + 1

            if bds_key not in batch_day_subjects:
                batch_day_subjects[bds_key] = []
            batch_day_subjects[bds_key].append(gene.subject_id)

        # --- Hard constraints (heavy penalty) ---
        for count in faculty_slot.values():
            if count > 1:
                score -= 100 * (count - 1)

        for count in room_slot.values():
            if count > 1:
                score -= 100 * (count - 1)

        for count in batch_slot.values():
            if count > 1:
                score -= 100 * (count - 1)

        # Faculty availability violation
        for gene in chrom.genes:
            faculty = self.faculties.get(gene.faculty_id, {})
            avail = faculty.get("availability", {})
            allowed_slots = avail.get(gene.day, list(range(1, 7)))
            if gene.slot not in allowed_slots:
                score -= 50

        # Room capacity vs batch strength
        for gene in chrom.genes:
            batch = next((b for b in self.batches if str(b["_id"]) == gene.batch_id), None)
            room = self.rooms_by_id.get(gene.room_id, {})
            if batch and room:
                strength = batch.get("strength", 60)
                capacity = room.get("capacity", 60)
                if strength > capacity:
                    score -= 30

            # Lab subjects must be in lab rooms
            if gene.is_lab:
                room_type = room.get("type", "classroom")
                if room_type != "lab":
                    score -= 40

        # --- Soft constraints (moderate penalty) ---
        # Avoid placing same subject twice in same day for same batch
        for (batch_id, day), subj_list in batch_day_subjects.items():
            from collections import Counter
            counts = Counter(subj_list)
            for subj_id, c in counts.items():
                if c > 1:
                    score -= 10 * (c - 1)

        # Stress-aware: detect 3+ consecutive heavy (lab) subjects for same batch
        for batch in self.batches:
            batch_id = str(batch["_id"])
            for day in DAYS:
                day_genes = sorted(
                    [g for g in chrom.genes if g.batch_id == batch_id and g.day == day],
                    key=lambda g: g.slot,
                )
                consecutive_heavy = 0
                for gene in day_genes:
                    subj = self.subjects.get(gene.subject_id, {})
                    if subj.get("is_lab", False):
                        consecutive_heavy += 1
                        if consecutive_heavy >= 3:
                            score -= 15
                    else:
                        consecutive_heavy = 0

        # Room utilization bonus (reward using rooms close to batch capacity)
        for gene in chrom.genes:
            batch = next((b for b in self.batches if str(b["_id"]) == gene.batch_id), None)
            room = self.rooms_by_id.get(gene.room_id, {})
            if batch and room:
                strength = batch.get("strength", 60)
                capacity = room.get("capacity", 60)
                if capacity > 0:
                    utilization = strength / capacity
                    if 0.7 <= utilization <= 1.0:
                        score += 5  # bonus for good utilization

        return max(score, 0.0)

    # ------------------------------------------------------------------ #
    #  SELECTION                                                           #
    # ------------------------------------------------------------------ #
    def _tournament_select(self, population: List[Chromosome], k: int = 5) -> Chromosome:
        competitors = random.sample(population, min(k, len(population)))
        return max(competitors, key=lambda c: c.fitness)

    # ------------------------------------------------------------------ #
    #  CROSSOVER                                                           #
    # ------------------------------------------------------------------ #
    def _crossover(self, parent1: Chromosome, parent2: Chromosome) -> Tuple[Chromosome, Chromosome]:
        if len(parent1.genes) < 2:
            return copy.deepcopy(parent1), copy.deepcopy(parent2)
        p1 = min(1, len(parent1.genes) - 1)
        p2 = min(len(parent1.genes) - 1, random.randint(p1, len(parent1.genes) - 1))

        g1 = parent1.genes[:p1] + parent2.genes[p1:p2] + parent1.genes[p2:]
        g2 = parent2.genes[:p1] + parent1.genes[p1:p2] + parent2.genes[p2:]
        return Chromosome(genes=g1), Chromosome(genes=g2)

    # ------------------------------------------------------------------ #
    #  MUTATION                                                            #
    # ------------------------------------------------------------------ #
    def _mutate(self, chrom: Chromosome) -> Chromosome:
        genes = copy.deepcopy(chrom.genes)
        for i, gene in enumerate(genes):
            if random.random() < self.mutation_rate:
                # Randomly change day/slot/room
                action = random.choice(["day", "slot", "room"])
                if action == "day":
                    gene.day = random.choice(DAYS)
                elif action == "slot":
                    gene.slot = random.choice(SLOTS)
                elif action == "room":
                    pool = self.lab_ids if gene.is_lab else self.classroom_ids
                    if not pool:
                        pool = self.room_ids
                    if pool:
                        gene.room_id = random.choice(pool)
        return Chromosome(genes=genes)

    # ------------------------------------------------------------------ #
    #  MAIN GA LOOP                                                        #
    # ------------------------------------------------------------------ #
    def run(self) -> Tuple[Chromosome, List[float]]:
        """Run genetic algorithm, return (best_chromosome, fitness_history)."""
        # Initialize population
        population = [self._random_chromosome() for _ in range(self.population_size)]

        # Evaluate
        for chrom in population:
            chrom.fitness = self._fitness(chrom)

        fitness_history: List[float] = []

        for gen in range(self.generations):
            population.sort(key=lambda c: c.fitness, reverse=True)
            best_fitness = population[0].fitness
            fitness_history.append(best_fitness)

            # Early stop if perfect solution found
            if best_fitness >= 990:
                break

            # Elite: keep top N
            new_population = population[:self.elite_size]

            # Fill rest via crossover + mutation
            while len(new_population) < self.population_size:
                p1 = self._tournament_select(population)
                p2 = self._tournament_select(population)
                c1, c2 = self._crossover(p1, p2)
                c1 = self._mutate(c1)
                c2 = self._mutate(c2)
                c1.fitness = self._fitness(c1)
                c2.fitness = self._fitness(c2)
                new_population.extend([c1, c2])

            population = new_population[:self.population_size]

        population.sort(key=lambda c: c.fitness, reverse=True)
        return population[0], fitness_history

    # ------------------------------------------------------------------ #
    #  CHROMOSOME → TIMETABLE DICT                                         #
    # ------------------------------------------------------------------ #
    def chromosome_to_timetable(self, chrom: Chromosome) -> Dict[str, Any]:
        """Convert best chromosome to structured week schedule per batch."""
        batch_timetables: Dict[str, Dict] = {}

        for batch in self.batches:
            batch_id = str(batch["_id"])
            batch_timetables[batch_id] = {
                "batch_id": batch_id,
                "batch_name": batch.get("name", ""),
                "week_schedule": {day: [] for day in DAYS},
                "fitness_score": chrom.fitness,
                "conflicts": [],
                "status": "draft",
            }

        for gene in chrom.genes:
            batch_id = gene.batch_id
            if batch_id not in batch_timetables:
                continue
            subj = self.subjects.get(gene.subject_id, {})
            faculty = self.faculties.get(gene.faculty_id, {})
            room = self.rooms_by_id.get(gene.room_id, {})

            slot_info = {
                "slot": gene.slot,
                "time": SLOT_TIMES.get(gene.slot, ""),
                "subject_id": gene.subject_id,
                "subject_name": subj.get("name", "Unknown"),
                "subject_code": subj.get("code", ""),
                "faculty_id": gene.faculty_id,
                "faculty_name": faculty.get("name", "Unknown"),
                "room_id": gene.room_id,
                "room_name": room.get("name", "Unknown"),
                "is_lab": gene.is_lab,
                "is_free": False,
                "is_break": False,
            }
            batch_timetables[batch_id]["week_schedule"][gene.day].append(slot_info)

        # Sort slots within each day
        for batch_id, tt in batch_timetables.items():
            for day in DAYS:
                tt["week_schedule"][day].sort(key=lambda s: s["slot"])
                # Fill missing slots as free
                existing_slots = {s["slot"] for s in tt["week_schedule"][day]}
                for slot_num in SLOTS:
                    if slot_num not in existing_slots:
                        tt["week_schedule"][day].append({
                            "slot": slot_num,
                            "time": SLOT_TIMES.get(slot_num, ""),
                            "subject_id": None,
                            "subject_name": None,
                            "subject_code": None,
                            "faculty_id": None,
                            "faculty_name": None,
                            "room_id": None,
                            "room_name": None,
                            "is_lab": False,
                            "is_free": True,
                            "is_break": False,
                        })
                tt["week_schedule"][day].sort(key=lambda s: s["slot"])

        return batch_timetables

    # ------------------------------------------------------------------ #
    #  CONFLICT DETECTION                                                  #
    # ------------------------------------------------------------------ #
    def detect_conflicts(self, chrom: Chromosome) -> List[str]:
        conflicts = []
        from collections import defaultdict

        faculty_slot: Dict[Tuple, List[str]] = defaultdict(list)
        room_slot: Dict[Tuple, List[str]] = defaultdict(list)
        batch_slot: Dict[Tuple, List[str]] = defaultdict(list)

        for gene in chrom.genes:
            fk = (gene.faculty_id, gene.day, gene.slot)
            rk = (gene.room_id, gene.day, gene.slot)
            bk = (gene.batch_id, gene.day, gene.slot)

            faculty = self.faculties.get(gene.faculty_id, {})
            subj = self.subjects.get(gene.subject_id, {})

            faculty_slot[fk].append(f"{subj.get('name', '')} ({faculty.get('name', '')})")
            room_slot[rk].append(gene.batch_id)
            batch_slot[bk].append(subj.get("name", ""))

        for (faculty_id, day, slot), items in faculty_slot.items():
            if len(items) > 1:
                faculty = self.faculties.get(faculty_id, {})
                conflicts.append(
                    f"Faculty conflict: {faculty.get('name', faculty_id)} on {day} slot {slot}: {', '.join(items)}"
                )

        for (room_id, day, slot), batches in room_slot.items():
            if len(batches) > 1:
                room = self.rooms_by_id.get(room_id, {})
                conflicts.append(
                    f"Room conflict: {room.get('name', room_id)} on {day} slot {slot}: {', '.join(batches)}"
                )

        for (batch_id, day, slot), subjects in batch_slot.items():
            if len(subjects) > 1:
                conflicts.append(
                    f"Batch conflict: {batch_id} on {day} slot {slot}: {', '.join(subjects)}"
                )

        return conflicts


# ------------------------------------------------------------------ #
#  FACULTY-WISE & ROOM-WISE VIEWS                                      #
# ------------------------------------------------------------------ #
def build_faculty_timetable(batch_timetables: Dict[str, Any]) -> Dict[str, Any]:
    """Pivot batch timetable to faculty-wise view."""
    faculty_view: Dict[str, Dict] = {}
    for batch_id, tt in batch_timetables.items():
        for day, slots in tt["week_schedule"].items():
            for slot in slots:
                if slot.get("is_free") or not slot.get("faculty_id"):
                    continue
                fid = slot["faculty_id"]
                if fid not in faculty_view:
                    faculty_view[fid] = {
                        "faculty_id": fid,
                        "faculty_name": slot["faculty_name"],
                        "week_schedule": {d: [] for d in DAYS},
                    }
                faculty_view[fid]["week_schedule"][day].append({
                    **slot,
                    "batch_id": batch_id,
                    "batch_name": tt["batch_name"],
                })

    # Sort slots
    for fid, fv in faculty_view.items():
        for day in DAYS:
            fv["week_schedule"][day].sort(key=lambda s: s["slot"])

    return faculty_view


def build_room_timetable(batch_timetables: Dict[str, Any]) -> Dict[str, Any]:
    """Pivot batch timetable to room-wise view."""
    room_view: Dict[str, Dict] = {}
    for batch_id, tt in batch_timetables.items():
        for day, slots in tt["week_schedule"].items():
            for slot in slots:
                if slot.get("is_free") or not slot.get("room_id"):
                    continue
                rid = slot["room_id"]
                if rid not in room_view:
                    room_view[rid] = {
                        "room_id": rid,
                        "room_name": slot["room_name"],
                        "week_schedule": {d: [] for d in DAYS},
                    }
                room_view[rid]["week_schedule"][day].append({
                    **slot,
                    "batch_id": batch_id,
                    "batch_name": tt["batch_name"],
                })

    for rid, rv in room_view.items():
        for day in DAYS:
            rv["week_schedule"][day].sort(key=lambda s: s["slot"])

    return room_view
