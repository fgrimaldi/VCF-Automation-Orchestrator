# applyVirtualMachineTags

This package provides a comprehensive solution for automating VMware vSphere Tag management within vRealize Orchestrator (vRO). It includes reusable Actions for interacting with the vAPI and a Workflow for batch processing tag assignments based on CMDB data.

## Features
*   **Tag Management**: Create Categories, Create Tags, and Assign Tags to Virtual Machines.
*   **Idempotency**: Ensures tags are only applied if they don't already exist.
*   **CMDB Integration**: Parse CSV data to map Server Names to Application IDs.
*   **Automated Workflow**: Search for VMs by name and apply tags in bulk.

## Documentation

Specific documentation for the components can be found in their respective directories:

*   **[Actions Documentation](./Actions/README.md)**
    *   Detailed reference for all scriptable actions (e.g., `attachTagIDtoVm`, `getOrCreateTagID`, `parseCmdbCsv`).

*   **[Workflow Documentation](./Workflow/README.md)**
    *   Guide for the **SearchVMApplyTag** workflow, including inputs, outputs, and logic flow.
