# findVmByName (vRO / Aria Orchestrator Action)

A high-performance vRO / Aria Orchestrator action that searches for a Virtual Machine by **name** across **all registered vCenter SDK connections** using the **vSphere PropertyCollector API**.  
It is significantly faster than looping through the inventory or using `getAllVirtualMachines()` methods.

> 🔎 Typical use case: quickly retrieve a `VC:VirtualMachine` object inside workflows or actions (snapshots, tagging, power ops, automation pipelines, etc.) starting from just the VM name.

---

## Key Features

- ✅ Searches **all vCenter connections** in `VcPlugin.allSdkConnections`  
- ✅ **Case-insensitive exact match** (`^vmName$`)  
- ✅ Uses **ContainerView + PropertyCollector** for optimal speed  
- ✅ Stops at the **first matching VM**  
- ✅ **Retry logic** when `viewManager` is not ready  
- ✅ Proper cleanup of `PropertyCollector` and `ContainerView` via `finally` block  

---

## Action Signature

- **Name:** `findVmByName`
- **Language:** JavaScript (Rhino — vRO 8.x)
- **Inputs**

| Name   | Type     | Required | Description                                |
|--------|----------|----------|--------------------------------------------|
| vmName | `string` | Yes      | Name of the VM to search (exact match, case-insensitive) |

- **Output**

| Type                                 | Description                                  |
|--------------------------------------|----------------------------------------------|
| `VC:VirtualMachine` \| `null`        | The matching VM object, or `null` if none is found |

---

## Requirements

- VMware **vRealize Orchestrator / Aria Orchestrator 8.18+**
- At least one valid vCenter connection in the vRO vCenter plugin  
  (`VcPlugin.allSdkConnections`)
- vCenter permissions sufficient to:
  - browse inventory  
