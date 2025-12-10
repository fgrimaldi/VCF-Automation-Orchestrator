if (!tagId) {
    throw "'tagId' parameter should not be null";
}

var assocService = new com_vmware_cis_tagging_tag__association(client);

// Prepare VM reference
var vmRef = new com_vmware_vapi_std_dynamic__ID();
vmRef.id = vcVm.id;
vmRef.type = vcVm.vimType;

// ----------------------------------------------------
// 1️⃣ Check if tag is already assigned to the VM
// ----------------------------------------------------
try {
    var attachedTags = assocService.list_attached_tags(vmRef);

    if (attachedTags && attachedTags.indexOf(tagId) !== -1) {
        System.log("ℹ️ Tag '" + tagId + "' is already assigned to VM '" + vcVm.name + "'. Skipping.");
        return true;   // Nothing else to do
    }

    System.log("🟦 Tag not yet assigned. Proceeding...");
} catch (e) {
    System.warn("⚠️ Unable to check existing tag associations. Will continue: " + e);
}

// ----------------------------------------------------
// 2️⃣ Assign tag (with retry)
// ----------------------------------------------------
for (var attempt = 1; attempt <= 5; attempt++) {
    try {
        assocService.attach(tagId, vmRef);
        System.log("✅ Tag '" + tagId + "' successfully assigned to VM '" + vcVm.name + "'");
        return true;

    } catch (e) {
        System.warn("⚠️ Attempt " + attempt + "/5 failed assigning tag '" + tagId + "' → " + e);

        if (attempt === 5) {
            System.error("❌ Failed to assign tag after 5 attempts: " + e);
            throw e;
        }

        System.sleep(500); // Small backoff
    }
}
