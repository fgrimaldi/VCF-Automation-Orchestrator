// --------------------------
// Initialize
// --------------------------
var failedTags = [];

var vapiEndpoints = Server.findAllForType("VAPI:VAPIEndpoint");
System.log("Starting VM tag application. Total VM entries: " + vmsArray.length);
System.debug("Total VAPI endpoints found: " + vapiEndpoints.length);

// --------------------------
// Loop through each VM entry
// --------------------------
for (var i = 0; i < vmsArray.length; i++) {
    var vmEntry = vmsArray[i];
    var vmName = vmEntry.server;
    var tagName = vmEntry.app_id;

    System.debug("Processing VM: " + vmName + ", Tag: " + tagName);

    // --------------------------
    // Find VM using regexp
    // --------------------------
    var vmsFound = System.getModule("com.vmware.library.vc.vm").getAllVMsMatchingRegexp("^" + vmName + "$");
    var vcVm;

    if (!vmsFound || vmsFound.length === 0) {
        var reason = "VM not found";
        System.warn(reason + ": " + vmName);
        failedTags.push({ server: vmName, tagName: tagName, reason: reason });
        continue;
    } else if (vmsFound.length > 1) {
        var reason = "VM not unique (multiple matches found)";
        System.warn(reason + ": " + vmName);
        failedTags.push({ server: vmName, tagName: tagName, reason: reason });
        continue;
    } else {
        vcVm = vmsFound[0];
        System.debug("VM found: " + vcVm.name);
    }


    // --------------------------
    // Find corresponding VAPI endpoint
    // --------------------------
    var vapiEndpoint = null;
    for (var j = 0; j < vapiEndpoints.length; j++) {
        var ep = vapiEndpoints[j];
        if (ep.name.match(vcVm.sdkConnection.sdkId)) {
            vapiEndpoint = ep;
            break;
        }
    }

    if (!vapiEndpoint) {
        var reason = "VAPI endpoint not found";
        System.warn(reason + " for VM: " + vmName + ". Skipping.");
        failedTags.push({ server: vmName, tagName: tagName, reason: reason });
        continue;
    }

    var client = vapiEndpoint.client();

    try {
        // --------------------------
        // Get or create category
        // --------------------------
        var categoryID = System.getModule("Unicredit.M-vSPHERE.Tags").getOrCreateCategoryTagID(client, categoryTagName);
        System.debug("Category ID: " + categoryID + " (Category: " + categoryTagName + ")");

        // --------------------------
        // Get or create tag
        // --------------------------
        var tagID = System.getModule("Unicredit.M-vSPHERE.Tags").getOrCreateTagID(client, tagName, categoryID);
        if (!tagID) {
            var reason = "Tag not found or could not be created";
            System.warn(reason + ": " + tagName);
            failedTags.push({ server: vmName, tagName: tagName, reason: reason });
            continue;
        }
        System.debug("Tag ID: " + tagID + " (Tag: " + tagName + ")");

        // --------------------------
        // Assign tag to VM
        // --------------------------
        try {
            System.getModule("Unicredit.M-vSPHERE.Tags").setTagID(client, tagID, vcVm);
            System.log("Tag '" + tagName + "' successfully applied to VM '" + vmName + "'");
        } catch (e) {
            var reason = e.toString();
            System.warn("Failed to assign tag '" + tagName + "' to VM '" + vmName + "': " + reason);
            failedTags.push({ server: vmName, tagName: tagName, reason: reason });
        }

    } catch (e) {
        var reason = e.toString();
        System.error("Error processing VM '" + vmName + "' for tag '" + tagName + "': " + reason);
        failedTags.push({ server: vmName, tagName: tagName, reason: reason });
    } finally {
        client.close();
    }
}

// --------------------------
// Summary of failures
// --------------------------
if (failedTags.length > 0) {
    System.log("Tag application completed with " + failedTags.length + " failure(s)");
    System.debug("Failed assignments details:\n" + JSON.stringify(failedTags, null, 2));
} else {
    System.log("Tag application completed successfully for all VMs");
}

System.log("VM tag assignment process finished");