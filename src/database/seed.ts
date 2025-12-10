import { db } from "@/database/database";

interface LookupTables {
	species: { id: number; species: string }[];
	sexes: { id: number; sex: string }[];
	statuses: { id: number; status: string }[];
	sizes: { id: number; size: string }[];
	colors: { id: number; color: string }[];
}

async function getLookupTables(): Promise<LookupTables> {
	const [species, sexes, statuses, sizes, colors] = await Promise.all([
		db.selectFrom("pet_species").selectAll().execute(),
		db.selectFrom("sexes").selectAll().execute(),
		db.selectFrom("pet_statuses").selectAll().execute(),
		db.selectFrom("pet_sizes").selectAll().execute(),
		db.selectFrom("pet_colors").selectAll().execute(),
	]);

	return { species, sexes, statuses, sizes, colors };
}

async function seed() {
	console.log("🌱 Starting database seed...\n");

	try {
		// Get lookup table IDs
		console.log("📋 Fetching lookup tables...");
		const lookup = await getLookupTables();

		// Helper to find lookup IDs
		const getSpeciesId = (name: string): number => {
			const item = lookup.species.find((i) => i.species === name);
			if (!item) throw new Error(`Species '${name}' not found`);
			return item.id;
		};

		const getSexId = (name: string): number => {
			const item = lookup.sexes.find((i) => i.sex === name);
			if (!item) throw new Error(`Sex '${name}' not found`);
			return item.id;
		};

		const getStatusId = (name: string): number => {
			const item = lookup.statuses.find((i) => i.status === name);
			if (!item) throw new Error(`Status '${name}' not found`);
			return item.id;
		};

		const getSizeId = (name: string): number => {
			const item = lookup.sizes.find((i) => i.size === name);
			if (!item) throw new Error(`Size '${name}' not found`);
			return item.id;
		};

		const getColorId = (name: string): number => {
			const item = lookup.colors.find((i) => i.color === name);
			if (!item) throw new Error(`Color '${name}' not found`);
			return item.id;
		};

		// Lookup IDs
		const dogId = getSpeciesId("dog");
		const catId = getSpeciesId("cat");
		const maleId = getSexId("male");
		const femaleId = getSexId("female");
		const inShelter = getStatusId("in_shelter");
		const smallId = getSizeId("small");
		const mediumId = getSizeId("medium");
		const largeId = getSizeId("large");
		const blackId = getColorId("black");
		const whiteId = getColorId("white");
		const brownId = getColorId("brown");
		const goldenId = getColorId("golden");
		const grayId = getColorId("gray");
		const orangeId = getColorId("orange");

		console.log("✅ Lookup tables loaded\n");

		// Create shelter
		console.log("🏠 Creating shelter...");
		const shelter = await db
			.insertInto("shelters")
			.values({
				name: "Happy Paws Animal Shelter",
				address: "123 Main Street",
				city: "San Francisco",
				state: "CA",
				country: "USA",
				zip: 94102,
				latitude: 37.7749,
				longitude: -122.4194,
			})
			.returning("id")
			.executeTakeFirstOrThrow();

		console.log(`✅ Created shelter with ID: ${shelter.id}\n`);

		// Create pets
		console.log("🐾 Creating pets...");

		const pets = [
			{
				name: "Max",
				birthdate: "2020-03-15",
				breed: "Golden Retriever",
				speciesId: dogId,
				sexId: maleId,
				statusId: inShelter,
				sizeId: largeId,
				description: "Friendly and energetic Golden Retriever. Loves to play fetch and great with kids!",
				shelterId: shelter.id,
				colorIds: [goldenId, whiteId],
			},
			{
				name: "Luna",
				birthdate: "2021-07-22",
				breed: "Siamese",
				speciesId: catId,
				sexId: femaleId,
				statusId: inShelter,
				sizeId: smallId,
				description: "Beautiful Siamese cat with stunning blue eyes. Very affectionate and loves cuddles.",
				shelterId: shelter.id,
				colorIds: [brownId, whiteId],
			},
			{
				name: "Rocky",
				birthdate: "2019-11-08",
				breed: "German Shepherd",
				speciesId: dogId,
				sexId: maleId,
				statusId: inShelter,
				sizeId: largeId,
				description: "Well-trained German Shepherd. Loyal, protective, and great for active families.",
				shelterId: shelter.id,
				colorIds: [blackId, brownId],
			},
			{
				name: "Bella",
				birthdate: "2022-01-30",
				breed: "Mixed Breed",
				speciesId: dogId,
				sexId: femaleId,
				statusId: inShelter,
				sizeId: mediumId,
				description: "Sweet mixed breed puppy. Playful, curious, and learning basic commands.",
				shelterId: shelter.id,
				colorIds: [blackId, whiteId],
			},
			{
				name: "Oliver",
				birthdate: "2020-09-12",
				breed: "Orange Tabby",
				speciesId: catId,
				sexId: maleId,
				statusId: inShelter,
				sizeId: mediumId,
				description: "Calm and gentle orange tabby. Perfect lap cat who enjoys sunny spots and treats.",
				shelterId: shelter.id,
				colorIds: [orangeId, whiteId],
			},
			{
				name: "Daisy",
				birthdate: "2021-05-18",
				breed: "Beagle",
				speciesId: dogId,
				sexId: femaleId,
				statusId: inShelter,
				sizeId: smallId,
				description: "Adorable Beagle with lots of energy. Loves exploring and following scents!",
				shelterId: shelter.id,
				colorIds: [brownId, whiteId, blackId],
			},
			{
				name: "Shadow",
				birthdate: "2019-02-25",
				breed: "Domestic Shorthair",
				speciesId: catId,
				sexId: maleId,
				statusId: inShelter,
				sizeId: mediumId,
				description: "Independent black cat with a mysterious charm. Enjoys quiet companionship.",
				shelterId: shelter.id,
				colorIds: [blackId],
			},
			{
				name: "Molly",
				birthdate: "2020-12-05",
				breed: "Labrador Retriever",
				speciesId: dogId,
				sexId: femaleId,
				statusId: inShelter,
				sizeId: largeId,
				description: "Gentle Labrador Retriever. Excellent with children and other pets.",
				shelterId: shelter.id,
				colorIds: [brownId],
			},
		];

		for (const petData of pets) {
			const { colorIds, ...petInfo } = petData;

			// Insert pet
			const pet = await db
				.insertInto("pets")
				.values({
					name: petInfo.name,
					birthdate: petInfo.birthdate,
					breed: petInfo.breed,
					species_id: petInfo.speciesId,
					sex_id: petInfo.sexId,
					status_id: petInfo.statusId,
					size_id: petInfo.sizeId,
					description: petInfo.description,
					shelter_id: petInfo.shelterId,
				})
				.returning("id")
				.executeTakeFirstOrThrow();

			// Insert pet colors (junction table)
			if (colorIds.length > 0) {
				await db
					.insertInto("pet_pet_colors")
					.values(colorIds.map((colorId) => ({ pet_id: pet.id, color_id: colorId })))
					.execute();
			}

			console.log(`✅ Created pet: ${petInfo.name} (ID: ${pet.id})`);
		}

		console.log("\n🎉 Database seeded successfully!\n");
		console.log("📊 Summary:");
		console.log(`   - Shelters: 1`);
		console.log(`   - Pets: ${pets.length}`);
		console.log("\n📸 Next Steps:");
		console.log("   1. Start the server: pnpm start:dev");
		console.log("   2. Upload pet photos using the API:");
		console.log("      POST http://localhost:8080/pet-photos");
		console.log("   3. List pets in your web app:");
		console.log(`      GET http://localhost:8080/pets?shelterId=${shelter.id}`);
		console.log("\n💡 See scripts/upload-photos.sh for photo upload examples");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		throw error;
	} finally {
		await db.destroy();
	}
}

// Run seed
seed()
	.then(() => {
		console.log("\n✨ Seed complete!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Seed error:", error);
		process.exit(1);
	});
