try {
    var tagService = new com_vmware_cis_tagging_tag(client);
    var tags = tagService.list_tags_for_category(categoryId);

    // Search existing tags
    if (tags && tags.length > 0) {
        for (var i = 0; i < tags.length; i++) {
            var tagId = tags[i];

            try {
                var tagObj = tagService.get(tagId);

                if (tagObj && tagObj.name === tagName) {
                    System.debug("✅ Found existing tag '" + tagName + "' → ID: " + tagId);
                    return tagId;
                }
            } catch (inner) {
                System.warn("⚠️ Cannot read tag '" + tagId + "' (VMware API bug). Skipping.");
            }
        }
    }

    // Tag NOT found → create new one
    System.warn("⚠️ Tag '" + tagName + "' not found in category " + categoryId + ". Creating it...");

    var spec = new com_vmware_cis_tagging_tag_create__spec();
    spec.category_id = categoryId;
    spec.name = tagName;
    spec.description = tagName;

    var newTagId = tagService.create(spec);

    System.debug("✨ Created new tag '" + tagName + "' → ID: " + newTagId);
    return newTagId;

} catch (e) {
    System.error("❌ Error in getTagID: " + e);
    return null;
}
