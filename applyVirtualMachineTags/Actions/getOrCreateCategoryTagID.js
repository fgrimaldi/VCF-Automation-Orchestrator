try {
    var catService = new com_vmware_cis_tagging_category(client);
    var categories = catService.list();

    // Search existing categories
    if (categories && categories.length > 0) {
        for (var i = 0; i < categories.length; i++) {
            var catId = categories[i];
            var categoryObj = catService.get(catId);

            if (categoryObj && categoryObj.name === categoryName) {
                System.debug("✅ Found existing category '" + categoryName + "' → ID: " + catId);
                return catId;
            }
        }
    }

    // Category NOT found → create it
    System.warn("⚠️ Category '" + categoryName + "' not found. Creating it...");

    var spec = new com_vmware_cis_tagging_category_create__spec();
    spec.name = categoryName;
    spec.description = categoryName;
    spec.cardinality = "SINGLE";
    spec.associable_types = null;

    var newCategoryId = catService.create(spec);

    System.debug("✨ Created new category '" + categoryName + "' → ID: " + newCategoryId);
    return newCategoryId;

} catch (e) {
    System.error("❌ Error in getCategoryTagID: " + e);
    return null;
}
