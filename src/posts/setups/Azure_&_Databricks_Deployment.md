# 🚀 Full Azure Databricks Deployment with Terraform: Explained

> 🔗 [databricks_uc_deploy project](https://github.com/MTPruett-DevOps/Help/tree/main/databricks_uc_deploy)

This post walks through our complete Terraform setup for deploying a fully governed, production-grade Azure Databricks workspace. We use a GitHub-based module with Unity Catalog, Azure AD integration, secure access, and monitoring. We’ll explain every resource and configuration that leads up to the module call.

---

## ⚙️ Terraform Cloud Setup

```hcl
terraform {
  cloud {
    hostname     = "app.terraform.io"
    organization = "internal-platform"
    workspaces {
      name = "databricks-governed"
    }
  }

  required_providers {
    azuread = {
      source  = "hashicorp/azuread"
      version = "3.4.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.32.0"
    }
    databricks = {
      source  = "databricks/databricks"
      version = "1.82.0"
    }
  }
}
```

This block configures:
- Terraform Cloud as the backend
- Required providers for Azure AD, AzureRM, and Databricks
- Pins versions to ensure consistent deployments

---

## 📦 Resource Consistency Module

```hcl
module "resource_consistency" {
  source  = "git::https://github.com/MTPruett-DevOps/Help//terraform-resource-consistency?ref=main"

  AssetName        = var.team_name
  DepartmentNumber = var.department_number
  DeployedBy       = var.deployed_by
  Environment      = var.environment
}
```

This shared module:
- Generates consistent naming conventions for all Azure resources
- Tags resources with business context

It returns outputs like:
- `naming.standard.*` for long-form names
- `naming.compact.*` for short Azure-compliant names
- `tagging` map to apply across all resources

> 🔗 [terraform-resource-consistency](https://github.com/MTPruett-DevOps/Help/tree/main/terraform-resource-consistency)

---

## ✨ Providers and Data Sources

We define two `azurerm` providers:

```hcl
provider "azurerm" {
  features {}
}

provider "azurerm" {
  alias           = "infrastructure"
  features        {}
  subscription_id = "00000000-1111-2222-3333-444455556666"
}
```

Other data blocks include:
- `azurerm_client_config`: retrieves current user info
- `azuread_group`: resolves Entra ID groups
- `azurerm_log_analytics_workspace`: grabs shared Log Analytics for monitoring

---

## 🛡 Core Azure Resources

### Resource Group

```hcl
resource "azurerm_resource_group" "ResourceGroup" {
  name     = module.resource_consistency.naming.standard.resource_group.name
  location = var.location
  tags     = module.resource_consistency.tagging
}
```

### Key Vault

- Created with strong access control
- Permissions granted to the current user, AZSubscriptionOwners group, AdminGroups, and DeveloperGroups

### Storage Account & Container

```hcl
resource "azurerm_storage_account" "StorageAccount" {
  name                     = module.resource_consistency.naming.compact.storage_account.name
  resource_group_name      = azurerm_resource_group.ResourceGroup.name
  location                 = var.location
  account_tier             = "Premium"
  account_replication_type = "LRS"
  account_kind             = "BlockBlobStorage"
  is_hns_enabled           = true
  tags                     = module.resource_consistency.tagging
}
```

> **Note:** `is_hns_enabled` must be set to `true` for Unity Catalog. It can only be `true` when `account_tier` is `Standard` or when `account_tier` is `Premium` and `account_kind` is `BlockBlobStorage`.

```hcl
resource "azurerm_storage_container" "StorageContainer" {
  name                  = "unity-catalog"
  storage_account_id    = azurerm_storage_account.StorageAccount.id
  container_access_type = "private"
}
```

### Access Connector

```hcl
data "azurerm_databricks_access_connector" "AccessConnector" {
  name                = "bmi-bricks-${var.environment}-acccess-connector-01"
  resource_group_name = "bmi-rg-${var.environment}-data-eus"
}
```

- Enables secure access from Databricks to Azure resources
- Assigned `Storage Blob Data Contributor` role

### Databricks Workspace

```hcl
resource "azurerm_databricks_workspace" "DatabricksWorkspace" {
  name                = module.resource_consistency.naming.standard.databricks_workspace.name
  location            = var.location
  resource_group_name = azurerm_resource_group.ResourceGroup.name
  sku                 = var.databricks_sku
  tags                = module.resource_consistency.tagging
}
```

---

## 🔍 Diagnostic Settings

```hcl
resource "azurerm_monitor_diagnostic_setting" "DatabricksMonitoring" {
  name                       = "...-diagnostics"
  target_resource_id         = azurerm_databricks_workspace.DatabricksWorkspace.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.BMILawsWorkspace.id
  dynamic "enabled_log" {
    for_each = toset(local.enabled_logs)
    content {
      category = enabled_log.value
    }
  }
}
```

---

## 🛠️ Main Module: Databricks + Unity Catalog

```hcl
module "Databricks" {
  source = "git::https://github.com/MTPruett-DevOps/Help//databricks_uc_module?ref=main"

  asset_name     = var.team_name
  account_id     = var.account_id
  metastore_id   = var.metastore_id
  environment    = var.environment

  jdbc_database  = var.SqlServerDatabaseName
  jdbc_host_name = var.SqlServerHostName
  jdbc_port      = var.SqlServerPort
  jdbc_username  = var.SqlServerUsername
  jdbc_password  = var.SqlServerPassword

  admin_groups   = var.admin_groups
  user_groups    = var.user_groups

  resource_group = azurerm_resource_group.ResourceGroup.name

  databricks_workspace = {
    name        = azurerm_databricks_workspace.DatabricksWorkspace.name
    id          = azurerm_databricks_workspace.DatabricksWorkspace.workspace_id
    resource_id = azurerm_databricks_workspace.DatabricksWorkspace.id
    url         = azurerm_databricks_workspace.DatabricksWorkspace.workspace_url
  }

  storage = {
    account_name   = azurerm_storage_account.StorageAccount.name
    container_name = azurerm_storage_container.StorageContainer.name
  }

  key_vault = {
    name = azurerm_key_vault.KeyVault.name
    id   = azurerm_key_vault.KeyVault.id
    uri  = azurerm_key_vault.KeyVault.vault_uri
  }

  access_connector = data.azurerm_databricks_access_connector.AccessConnector.name
}
```

### ✅ Module Responsibilities

- Attaches the workspace to a Unity Catalog metastore
- Configures JDBC federation for SQL Server
- Assigns Azure AD groups via **Automatic Identity Management**
- Registers external locations backed by ADLS
- Creates secret scopes using Azure Key Vault

---

## 📄 Summary

This deployment pattern ensures:

- Consistent, secure Azure resource naming and tagging
- Full Databricks integration with Unity Catalog and Key Vault
- Fine-grained role and storage access control
- Scalable diagnostics and observability

By modularizing all components, we simplify onboarding, improve compliance, and accelerate delivery across teams.
