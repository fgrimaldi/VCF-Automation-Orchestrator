// ============================================================================
//  Action: findVmByName
//  Purpose:
//    Given a VM name, search all vCenter SDK connections using the vSphere
//    PropertyCollector (ContainerView + PropertyFilterSpec) and return the
//    first VC:VirtualMachine object whose name matches vmName
//    (case-insensitive exact match).
//
//  Inputs:
//    - vmName : string
//
//  Output:
//    - VC:VirtualMachine (or null if not found)
// ============================================================================

if (!vmName || vmName.trim() === "") {
    System.warn("[findVmByName_fast] vmName is empty - returning null");
    return null;
}

System.debug("[findVmByName_fast] Searching VM with name = '" + vmName + "'");

// Regex for case-insensitive exact match
var namePattern = new RegExp("^" + vmName + "$", "i");

// Array to store Dunes URIs of found VMs
var foundVmUris = [];
var currentVc = null;

// ---------------------------------------------------------------------------
// Helper: process objects returned by PropertyCollector
// ---------------------------------------------------------------------------
function processObjects(retrieveResult) {
    var objects = retrieveResult.objects;

    for (var i in objects) {
        var objContent = objects[i];
        var morefValue = objContent.obj.id;     // MoRef, e.g. "vm-1234"
        var type       = objContent.obj.type;   // "VirtualMachine"
        var props      = objContent.propSet;

        for (var p in props) {
            var vmNameVal = props[p].val;
            if (namePattern.test(vmNameVal)) {

                var dunesUri =
                    "dunes://service.dunes.ch/CustomSDKObject?id='" +
                    currentVc.id + ",id:" + morefValue +
                    "'&dunesName='VC:" + type + "'";

                foundVmUris.push(dunesUri);

                System.debug("[findVmByName_fast] Match found on VC '" + currentVc.name +
                             "': name=" + vmNameVal + ", moRef=" + morefValue);
                return true;  // stop at first match
            }
        }
    }
    return false;
}

// ---------------------------------------------------------------------------
// 1) Main search loop (with retry logic if viewManager isn't ready)
// ---------------------------------------------------------------------------
var retries = 3;
var viewManagerMissing = false;

while (retries > 0) {
    viewManagerMissing = false;

    var vcs = VcPlugin.allSdkConnections;
    if (!vcs || vcs.length === 0) {
        System.warn("[findVmByName_fast] No vCenter SDK connections found");
        break;
    }

    for each (var vc in vcs) {
        if (!vc) continue;

        if (!vc.viewManager) {
            viewManagerMissing = true;
            System.warn("[findVmByName_fast] viewManager undefined on VC '" + vc + "'");
            break;
        }

        currentVc = vc;

        // -------------------------------------------------------------------
        // Create ContainerView for VirtualMachine objects
        // -------------------------------------------------------------------
        var containerView = vc.viewManager.createContainerView(
            vc.rootFolder,
            ["VirtualMachine"],
            true
        );

        // ObjectSpec
        var oSpec = new VcObjectSpec();
        oSpec.obj = containerView.reference;
        oSpec.skip = true;

        // TraversalSpec
        var tSpec = new VcTraversalSpec();
        tSpec.type = "ContainerView";
        tSpec.path = "view";
        tSpec.skip = false;
        tSpec.name = "traverseEntities";
        oSpec.selectSet = [tSpec];

        // PropertySpec (we only need "name")
        var pSpec = new VcPropertySpec();
        pSpec.type = "VirtualMachine";
        pSpec.pathSet = ["name"];

        // FilterSpec
        var fSpec = new VcPropertyFilterSpec();
        fSpec.objectSet = [oSpec];
        fSpec.propSet = [pSpec];

        var retrieveOptions = new VcRetrieveOptions();
        var collector = vc.propertyCollector.createPropertyCollector();

        try {
            var result = collector.retrievePropertiesEx([fSpec], retrieveOptions);

            while (result) {
                if (processObjects(result)) break;

                var token = result.token;
                if (!token) break;

                result = collector.continueRetrievePropertiesEx(token);
            }
        } catch (err) {
            System.warn("[findVmByName_fast] Error on VC '" + vc.name + "': " + err);
        } finally {
            try { collector.destroyPropertyCollector(); } catch (ignore1) {}
            try { containerView.destroyView(); } catch (ignore2) {}
        }

        if (foundVmUris.length > 0) break;
    }

    if (!viewManagerMissing) break;

    retries--;
    System.warn("[findVmByName_fast] viewManager missing, retrying... retries left: " + retries);
}

// ---------------------------------------------------------------------------
// 2) Return the found VM
// ---------------------------------------------------------------------------
if (foundVmUris.length === 0) {
    System.warn("[findVmByName_fast] No VM found for name '" + vmName + "'");
    return null;
}

if (foundVmUris.length > 1) {
    System.warn("[findVmByName_fast] Multiple VMs found for '" + vmName + "', returning the first.");
}

var vmObject = Server.fromUri(foundVmUris[0]);
System.debug("[findVmByName_fast] Returning VM: " + vmObject.name + " (" + vmObject.id + ")");
return vmObject;
