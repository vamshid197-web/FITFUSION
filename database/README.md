# FITFUSION Database Directory

This directory serves as the schema definition, migrations, and seed data repository for **FITFUSION**, targeting Cloud Firestore / Firebase.

> **Status:** At this initial scaffolding stage, no database collections or live connections have been established. This directory maintains architectural documentation and placeholders for future implementation.

---

## Directory Structure

- `schema/`: Will contain Firestore security rules (`firestore.rules`), indexing specifications (`firestore.indexes.json`), and schema validation schemas.
- `seeds/`: Will contain initial development seed scripts and sample datasets.

---

## Planned Data Domains

In upcoming development phases, this directory will provide design definitions and seed/sample data for:

1. **Users**: Customer profiles, credentials, access roles, and preferences.
2. **Products**: Customizable clothing silhouettes, base garment patterns, and cuts.
3. **Fabrics**: Textile swatches, material compositions, high-resolution textures, and colorways.
4. **Perfumes**: Fragrance pairings, aromatic notes, and occasion mappings.
5. **Customizations**: Garment component choices (collars, cuffs, buttons, monograms, pockets).
6. **Orders**: Tailoring lifecycle states, invoices, and consignment shipping info.
7. **Offers**: Discount coupons, promotional rules, and wallet cashback terms.
8. **Cart**: User and guest shopping bags holding bespoke outfit configurations.
9. **Addresses**: Customer delivery and billing address books.
10. **Measurements**: Precision tailor measurement profiles and bespoke fit adjustments.
