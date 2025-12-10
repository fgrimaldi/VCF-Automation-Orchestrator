# Actions Documentation

Below is a summary of the actions available in this package, designed for managing VMware Tags and parsing CMDB data.

| Action | Description | Key Inputs |
| :--- | :--- | :--- |
| **`attachTagIDtoVm`** | Orchestrates the application of multiple tags to a specific Virtual Machine. It handles VAPI connections and iterates through the provided tag list. | `vcVm` (VC:VirtualMachine)<br>`tagsArray` (Array of objects) |
| **`getOrCreateCategoryTagID`** | Retrieves the ID of an existing Tag Category. If the category does not exist, it automatically creates a new one with "SINGLE" cardinality. | `client` (VAPI Client)<br>`categoryName` (string) |
| **`getOrCreateTagID`** | Retrieves the ID of an existing Tag within a specific category. If the tag does not exist, it is created. | `client` (VAPI Client)<br>`tagName` (string)<br>`categoryId` (string) |
| **`setTagID`** | Assigns a specific Tag ID to a VM. Includes idempotency checks (skips if already assigned) and retry logic for robustness. | `client` (VAPI Client)<br>`tagId` (string)<br>`vcVm` (VC:VirtualMachine) |
| **`parseCmdbCsv`** | Parses a CSV file (provided as a MIME attachment) to extract server details and Application IDs, filtering for VMware virtualization. | `mimeAttachment` (MimeAttachment) |
