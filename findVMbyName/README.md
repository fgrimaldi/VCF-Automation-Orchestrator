# findVmByName (vRO / Aria Orchestrator Action)

A high-performance VMware Aria Orchestrator (vRO) action that searches for a Virtual Machine by **name** across **all registered vCenter SDK connections** using the **vSphere PropertyCollector API**.  
This approach is significantly faster and more efficient than iterating through the vCenter inventory or using `getAllVirtualMachines()`.

> 🔎 **Goal:** Retrieve a `VC:VirtualMachine` object as quickly and reliably as possible using a case-insensitive exact name match.

---

## Key Features

- 🔍 Searches **all vCenters** registered in `VcPlugin.allSdkConnections`
- 🔤 Performs **case-insensitive exact matching** (`^vmName$`)
- ⚡ Uses **ContainerView + PropertyCollector** for maximum speed
- 🛑 Stops immediately after the first match
- 🔁 Includes **retry logic** if the vCenter `viewManager` is not ready
- 🧹 Automatically cleans up `PropertyCollector` and `ContainerView`
- 🪪 Returns the VM using a resolved **Dunes URI** via `Server.fromUri()`

---

## Action Name

**findVmByName**

---

## Action Signature

### Inputs
| Name   | Type     | Required | Description |
|--------|----------|----------|-------------|
| vmName | string   | Yes      | VM name to search (case-insensitive exact match). |

### Output
| Type                           | Description |
|--------------------------------|-------------|
| `VC:VirtualMachine` \| `null`  | Matching VM or `null` if not found. |

---

## Requirements

- VMware **Aria Orchestrator / vRealize Orchestrator 8.18+**
- At least one **vCenter SDK connection**
- Permissions allowing:
  - inventory browsing  
  - ViewManager access  
  - PropertyCollector API queries  

---

## How It Works (High-Level Overview)

### 1. Input validation  
If `vmName` is null, empty, or blank → logs a warning and returns `null`.

### 2. Build strict matching regex
```js
new RegExp("^" + vmName + "$", "i");
```
Ensures exact name matching, ignoring case sensitivity.

---

### 3. Iterate through all vCenters

For every vCenter:

- Checks if its `viewManager` exists  
- If missing, retries up to **3 times**  
- Sets up inventory scanning using a `ContainerView`

---

### 4. Use PropertyCollector for fast retrieval

The action constructs:

- **ObjectSpec** → points to `ContainerView`  
- **TraversalSpec** → traverses through VM objects  
- **PropertySpec** → retrieves only `"name"`  
- **FilterSpec** → ties everything together  

It then uses:

- `retrievePropertiesEx()`  
- `continueRetrievePropertiesEx()` (with paging tokens)

---

### 5. Identify the VM

During processing:

- Compares each VM's name to the regex  
- When the first match is found:
  - Builds a **Dunes URI**
  - Stores it
  - Stops scanning immediately (performance optimization)

---

### 6. Cleanup

Always executed in a `finally` block:

```js
collector.destroyPropertyCollector();
containerView.destroyView();
```

---

### 7. Return the VM

- If **no matches**, returns `null`  
- If **multiple matches**, logs a warning and returns the **first**  
- Converts the Dunes URI to a real object:

```js
Server.fromUri(foundVmUris[0]);
```

---

## Usage Examples

### Example 1 – Workflow Scriptable Task

```js
var vm = System.getModule("your.module").findVmByName(vmName);

if (!vm) {
    throw "VM '" + vmName + "' was not found in any registered vCenter.";
}

System.log("Found VM: " + vm.name + " (id: " + vm.id + ")");
```

---

### Example 2 – Power Off VM by Name

```js
var vm = findVmByName(vmName);
if (!vm) throw "Cannot find VM '" + vmName + "'.";

if (vm.runtime.powerState === "poweredOn") {
    System.log("Powering off: " + vm.name);
    vm.powerOffVM_Task();
} else {
    System.log("VM is already powered off.");
}
```

---

## Logging Reference

### Input or environment issues
```
[findVmByName] vmName is empty - returning null
[findVmByName] No vCenter SDK connections found
[findVmByName] viewManager undefined on VC '...'
[findVmByName] viewManager missing, retrying... retries left: X
```

### Match found
```
[findVmByName] Match found on VC '<vc>': name=<vmName>, moRef=vm-1234
```

### No result
```
[findVmByName] No VM found for name '<vmName>'
```

### Multiple matches
```
[findVmByName] Multiple VMs found for '<vmName>', returning the first.
```

### Final output
```
[findVmByName] Returning VM: <name> (<id>)
```

---

## Notes & Limitations

- Performs **strict exact match**, case-insensitive  
  - `"web01"` matches `"web01"`  
  - Does **not** match `"web01-prod"` or `"web01.domain.local"`
- If multiple VMs have the same name, **only the first** is returned  
- Does not filter by:
  - datacenter  
  - folder  
  - tags  
  - cluster  
  Extend the action if you need more advanced filtering.

---

## Suggested Git Repository Structure

```
.
├── actions/
│   └── findVmByName.js       # exported vRO action code
└── README.md                 # this documentation
```

Recommended header inside `findVmByName.js`:

```js
// Action: findVmByName
// Description: Fast VM lookup by name across all registered vCenter SDK connections
// Input: vmName (string)
// Output: VC:VirtualMachine or null
```

---

## License

```
MIT / Apache-2.0 / or any preferred license
```
