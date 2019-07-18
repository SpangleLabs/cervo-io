# Manual tests
## View tests
- Test that switch to alphabetical and refresh, still on alphabetical
  - check that when switching back to taxonomical, base categories have loaded
## Taxonomy tests
- Test that taxonomy loads base categories
- Open category, check spinner appears, then disappears
- Expand cervinae, cervini, axis, Select chital, ensure it appears in selected species, and zoos
- Expand cervinae, cervini, axis, select chital, unselect chital, select cervini, ensure no infinite loop
- Expand cervinae, cervini, axis, select axis, unselect chital, unselect axis, ensure chital isn't selected
- Select chital in taxonomy, use the selector to unselect it, ensure it's unselected in taxonomy

- Select chital on taxonomy view, go to alphabetical view, ensure it is selected
- Select fallow on alphabetical view, go to taxonomy view, and ensure it is selected once loaded
- Load C on alphabetical view, go to taxonomy view and select chital, ensure it is selected on alphabetical view
