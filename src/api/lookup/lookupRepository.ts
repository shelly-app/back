import type {
	PetColorLookup,
	PetSizeLookup,
	PetSpeciesLookup,
	PetStatusLookup,
	SexLookup,
} from "@/api/lookup/lookupModel";
import { db } from "@/database";

export class LookupRepository {
	async findAllPetSpeciesAsync(): Promise<PetSpeciesLookup[]> {
		const species = await db.selectFrom("pet_species").selectAll().execute();

		return species.map((s) => ({
			id: s.id,
			species: s.species,
		}));
	}

	async findAllSexesAsync(): Promise<SexLookup[]> {
		const sexes = await db.selectFrom("sexes").selectAll().execute();

		return sexes.map((s) => ({
			id: s.id,
			sex: s.sex,
		}));
	}

	async findAllPetStatusesAsync(): Promise<PetStatusLookup[]> {
		const statuses = await db.selectFrom("pet_statuses").selectAll().execute();

		return statuses.map((s) => ({
			id: s.id,
			status: s.status,
		}));
	}

	async findAllPetSizesAsync(): Promise<PetSizeLookup[]> {
		const sizes = await db.selectFrom("pet_sizes").selectAll().execute();

		return sizes.map((s) => ({
			id: s.id,
			size: s.size,
		}));
	}

	async findAllPetColorsAsync(): Promise<PetColorLookup[]> {
		const colors = await db.selectFrom("pet_colors").selectAll().execute();

		return colors.map((c) => ({
			id: c.id,
			color: c.color,
		}));
	}
}

export const lookupRepository = new LookupRepository();
