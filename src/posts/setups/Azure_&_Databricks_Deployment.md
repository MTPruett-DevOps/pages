# Terraform Tutorial: Azure & Databricks Deployment

This Terraform package provisions the following resources:

- Azure Resource Group  
- Azure Storage Account (Premium with hierarchical namespace)  
- Azure Storage Container  
- Databricks Workspace  
- Databricks Cluster (shared)  
- Databricks Permission Assignments (admin and user access)  
- Unity Catalog Catalog with admin/user grants  
- Optional: Group lookups and Metastore assignment  

This guide walks you through setting up standardized Azure resource tags and a complete Databricks environment using two Terraform projects:

- `terraform-resource-consistency`
- `terraform-databricks`

By the end, you'll have a reusable foundation for deploying consistent infrastructure with tagging, secure storage, Databricks compute, and Unity Catalog.

---

## 🚀 Prerequisites

- Terraform
- Azure CLI authenticated (`az login`)  
- Access to Azure and Databricks subscriptions  
- Optional: Terraform Cloud/Enterprise (for remote state)

Authentication is handled as follows:

- **Azure**: via the `azurerm` provider and Azure CLI or Managed Identity  
- **Databricks**: via the `databricks` provider using workspace host URLs and Azure authentication (via environment variables or explicit credentials)

---

## Step 1: Standardizing Tags and Naming Conventions

This section explains the `terraform-resource-consistency` module and its integration with the `Azure/naming/azurerm` module.

### 1. Standardized Tags

Located in `outputs.tf`:

```hcl
output "tagging" {
  value = merge(
    {
      AssetName        = upper(var.AssetName),
      DepartmentNumber = upper(var.DepartmentNumber),
      DeployedBy       = upper(var.DeployedBy)
    },
    var.ChangeRequestID != "" ? { ChangeRequestID = upper(var.ChangeRequestID) } : {},
    var.Project         != "" ? { Project         = upper(var.Project) } : {},
    var.Environment     != "" ? { Environment     = upper(var.Environment) } : {},
    var.Region          != "" ? { Region          = upper(var.Region) } : {}
  )
}
```

This ensures consistent capitalization and conditional inclusion of optional fields.

### 2. Standard vs Compact Naming

```hcl
module "standard" {
  source = "Azure/naming/azurerm"
  suffix = [
    join("-", compact([
      lower(var.Environment),
      lower(var.AssetName),
      lower(var.Project)
    ]))
  ]
}

module "compact" {
  source = "Azure/naming/azurerm"
  suffix = [
    join("", compact([
      lower(var.Environment),
      lower(var.AssetName),
      lower(var.Project)
    ]))
  ]
}
```

- `standard` uses hyphens (`-`) between components  
- `compact` removes hyphens (required for resources like Storage Accounts)

> ⚠️ Use `compact` naming for resources with strict constraints (e.g., lowercase only, no dashes)

### 🧩 Real Usage Examples

#### Example A

```hcl
module "tags" {
  source = "git::https://github.com/mt-devops/terraform-resource-consistency.git"

  ChangeRequestID  = "CHG12345"
  DepartmentNumber = "Dept01"
  Project          = "project-alpha"
  AssetName        = "spark-data"
  DeployedBy       = "terraform"
  Environment      = "dev"
  Region           = "eastus"
}
```

#### Example B

```hcl
module "naming" {
  source  = "app.terraform.io/mt-devops/resource-consistency/mt"
  version = "1.0.13"

  AssetName        = var.team_name
  DepartmentNumber = var.department_number
  DeployedBy       = var.deployed_by
  Environment      = var.environment
}
```

---

## Step 2: Deploying Databricks with `terraform-databricks`

This project provisions:

- ADLS Gen2 storage account + container  
- Databricks access connector and role assignment  
- Databricks workspace  
- Shared compute cluster  
- Unity Catalog and access grants  

### Root `main.tf` Resources

```hcl
resource "azurerm_resource_group" "ResourceGroup" {
  name     = module.naming.naming.standard.resource_group.name
  location = var.location
}
```

```hcl
resource "azurerm_storage_account" "StorageAccount" {
  name                     = "${module.naming.naming.compact.storage_account.name}02"
  resource_group_name      = azurerm_resource_group.ResourceGroup.name
  location                 = var.location
  account_tier             = "Premium"
  account_replication_type = "LRS"
  tags                     = module.tagging.tagging
}
```

> **Note:** Premium is required for hierarchical namespace support.

```hcl
resource "azurerm_storage_container" "StorageContainer" {
  name                  = "unity-catalog"
  storage_account_id    = azurerm_storage_account.StorageAccount.id
  container_access_type = "private"
}
```

```hcl
data "azurerm_databricks_access_connector" "AccessConnector" {
  name                = "bmi-bricks-${var.environment}-acccess-connector-01"
  resource_group_name = "bmi-rg-${var.environment}-data-eus"
}
```

> Use this to reference external resources not managed in your state.

```hcl
resource "azurerm_role_assignment" "RoleAssignment" {
  principal_id         = data.azurerm_databricks_access_connector.AccessConnector.identity[0].principal_id
  role_definition_name = "Storage Blob Data Contributor"
  scope                = azurerm_storage_account.StorageAccount.id
}
```

> Required for Unity Catalog to read/write from storage.

```hcl
resource "azurerm_databricks_workspace" "DatabricksWorkspace" {
  name                = module.naming.naming.standard.databricks_workspace.name
  location            = var.location
  resource_group_name = azurerm_resource_group.ResourceGroup.name
  sku                 = var.databricks_sku
  tags                = module.tagging.tagging
}
```

---

## 🔐 Provider Authentication

### Azure

```hcl
provider "azurerm" {
  features {}
}
```

### Databricks

```hcl
provider "databricks" {
  alias = "workspace"
  host  = azurerm_databricks_workspace.DatabricksWorkspace.workspace_url
  azure_workspace_resource_id = azurerm_databricks_workspace.DatabricksWorkspace.id
}
```

These values can be provided via environment variables:

- `ARM_CLIENT_ID`  
- `ARM_CLIENT_SECRET`  
- `ARM_SUBSCRIPTION_ID`  
- `ARM_TENANT_ID`  

Or explicitly in the provider block:

```hcl
azure_client_id       = var.azure_client_id
azure_client_secret   = var.azure_client_secret
azure_tenant_id       = var.azure_tenant_id
azure_subscription_id = var.azure_subscription_id
```

---

## ✅ Summary

- Tags and names are standardized across all modules  
- Storage, access, and workspace provisioning is fully automated  
- Unity Catalog is secured and governed with group-based access  
- Built to be reusable across multiple environments and teams  
