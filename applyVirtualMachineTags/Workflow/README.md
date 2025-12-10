# Workflow: SearchVMApplyTag

This workflow automates the process of finding Virtual Machines by name and applying a specific tag (Application ID) to them.

## Description

The **SearchVMApplyTag** workflow iterates through a provided list of server details. For each entry, it searches for a matching Virtual Machine in the vCenter inventory (using a regex match on the name). Once the VM is identified, it determines the correct VAPI endpoint and ensures the target Tag Category and Tag exist before assigning the tag to the VM.

## Key Logic

1.  **Iterate Input**: Loops through the `vmsArray` input.
2.  **Find VM**: Uses `getAllVMsMatchingRegexp` to find a VM matching `^serverName$`.
    *   *Error Handling*: Skips if 0 or >1 VMs are found.
3.  **Resolve VAPI Endpoint**: Matches the VM's SDK ID to a registered `VAPI:VAPIEndpoint`.
4.  **Get/Create Category**: Ensures the Tag Category (defined by `categoryTagName`) exists.
5.  **Get/Create Tag**: Ensures a tag with the name `vmEntry.app_id` exists in that category.
6.  **Assign Tag**: Associates the tag with the VM.
7.  **Summary**: Logs a summary of successfully processed VMs and lists any failures.

## Inputs

| Name | Type | Description |
| :--- | :--- | :--- |
| `vmsArray` | `Array/Properties` | A list of objects containing server details. Each object must have `server` (VM Name) and `app_id` (Tag Name) properties. |
| `categoryTagName` | `string` | The name of the Tag Category to use (e.g., "ApplicationID"). |

## Outputs / Logs

-   **System Logs**: Detailed debug and info logs for every step (VM found, Tag created, Tag assigned).
-   **Failure Summary**: If any VM fails processing (not found, connection error, etc.), a JSON summary of failures is logged at the end.
