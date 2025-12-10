if (!vcVm) {
    throw "applyTagsToVm: vcVm is null or undefined.";
}

if (!tagsArray || !Array.isArray(tagsArray) || tagsArray.length === 0) {
    throw "applyTagsToVm: tagsArray must be a non-empty array of { category, tag } objects.";
}

System.debug("Preparing to apply " + tagsArray.length + " tags to VM: " + vcVm.name);

//
// 1. Identify VAPI endpoint
//
var vapiEndpoints = Server.findAllForType("VAPI:VAPIEndpoint");
var vapiEndpoint = null;

for (var i = 0; i < vapiEndpoints.length; i++) {
    var ep = vapiEndpoints[i];
    if (ep.name.match(vcVm.sdkConnection.sdkId)) {
        vapiEndpoint = ep;
        break;
    }
}

if (!vapiEndpoint) {
    throw "No VAPI endpoint found for SDK ID '" + vcVm.sdkConnection.sdkId + "'";
}

var client = vapiEndpoint.client();

try {

    //
    // 2. Loop through each tag to apply
    //
    for (var t = 0; t < tagsArray.length; t++) {
        var entry = tagsArray[t];

        if (!entry || !entry.category || !entry.tag) {
            System.warn("Skipping invalid tagsArray entry at index " + t);
            continue;
        }

        var categoryName = entry.category;
        var tagName = entry.tag;

        System.debug("Processing tag '" + tagName + "' (Category: '" + categoryName + "')");

        //
        // 2a. Get/create category
        //
        var categoryId;
        try {
            categoryId = System.getModule("module.Tags")
                .getOrCreateCategoryTagID(client, categoryName);
        } catch (e) {
            System.error("Unable to create or retrieve category '" + categoryName + "': " + e);
            continue;
        }

        if (!categoryId) {
            System.error("Category not found or created: " + categoryName);
            continue;
        }

        //
        // 2b. Get/create tag
        //
        var tagId;
        try {
            tagId = System.getModule("module.Tags")
                .getOrCreateTagID(client, tagName, categoryId);
        } catch (e) {
            System.error("Unable to create or retrieve tag '" + tagName + "': " + e);
            continue;
        }

        if (!tagId) {
            System.error("Tag not found or created: " + tagName);
            continue;
        }

        //
        // 2c. Assign tag
        //
        try {
            System.getModule("module.Tags").setTagID(client, tagId, vcVm);
            System.debug("Tag '" + tagName + "' assigned to VM '" + vcVm.name + "'");
        } catch (e) {
            System.error("Failed to assign tag '" + tagName + "' to VM '" + vcVm.name + "': " + e);
            continue;
        }
    }

} finally {
    client.close();
    System.debug("VAPI client connection closed");
}