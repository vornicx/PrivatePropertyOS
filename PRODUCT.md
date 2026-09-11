# Product rules — Private Property OS

## North star

The product must answer one operational question faster than the agency can answer it manually:

> A new property has arrived. Which buyers should we contact first, and why?

## Hard product rules

1. **Time saved before visual polish.** A feature stays only if it removes manual work, improves prioritisation, or helps move a buyer toward a viewing/offer.
2. **Import before data entry.** Agencies must be able to bring an existing buyer list in bulk. Manual entry is secondary.
3. **Explain every recommendation.** Matching is never a black box. Show budget, location, property type, bedrooms and requested features.
4. **Match → action.** Every useful match needs a next action: contact, copy/send message, mark interested/not interested, or later create a shortlist.
5. **Do not become a generic CRM.** We are not rebuilding contacts, tasks and pipelines unless they directly support the match-to-sale workflow.
6. **No marketplace dependency.** The agency already owns the inventory and buyer relationships. The product improves how those two datasets are connected.
7. **Private by default for real data.** Production data will use authenticated multi-tenant storage, server-side authorisation and tenant isolation/RLS.

## MVP validation question

After a 10-minute demo, an agent should be able to say:

> “When a new listing enters, this saves me from manually reviewing hundreds of buyers.”

If the reaction is only “it looks nice”, the MVP has failed.

## Current MVP workflow

CSV buyer import → new property → ranked matches → reason breakdown → commercial message → contacted/interested/not-interested state.

## Deliberately deferred

- Public luxury marketplace
- Native mobile app
- Full CRM replacement
- AI-generated match scores
- Brochure/PDF generator
- Complex analytics
- Contracts and legal workflow
- Billing
