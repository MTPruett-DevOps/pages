
# Automating Databricks Unity Catalog with Terraform: A Modular Approach

👉 [MTPruett-DevOps/Help](https://github.com/MTPruett-DevOps/Help)
You can grab the databricks_uc_module there

Managing data governance and access control at scale is challenging — especially in platforms like Databricks where Unity Catalog is a powerful but complex feature set. In this post, we’ll break down a **modular Terraform approach** to provisioning Unity Catalog using a reusable, cloud-native design.

> This guide assumes familiarity with Terraform and Databricks. We’re using the Azure flavor of Databricks, though the pattern can be adapted elsewhere.

---

## 🧱 Why a Modular Design?

Our goal was to create a **clean, decoupled Terraform module** that could be reused across environments — production, staging, and beyond. The design focuses on three key responsibilities:

- Fetching the **account-level group IDs** needed for access policies  
- Assigning an **existing Unity Catalog metastore** to the workspace  
- Deploying **catalogs, schemas, and external locations** using Unity Catalog

Each of these is encapsulated in its own internal module: `account`, `workspace`, and `unity_catalog`.

---

## 🔩 Internal Module Breakdown

### 1. `account`: Fetch Group IDs

The `account` module uses the **account-level Databricks provider** to pull group IDs for admins, users, and owners. This is critical because access policies and ownership require explicit group bindings.

It also prepares Unity Catalog access by defining:

- A **storage credential** pointing to an Azure Data Lake container

💡 **Provider:** `databricks.account`  
📍Scope: Account-level operations

---

### 2. `workspace`: Assign the Metastore

This module handles the critical task of **assigning an existing Unity Catalog metastore** to a workspace and enabling identity federation features.

It uses the **workspace-level provider** and is responsible for:

- Enabling Unity Catalog features via workspace settings  
- Associating the **pre-existing metastore** to the target workspace

💡 **Provider:** `databricks.workspace`  
📍Scope: Workspace configuration

---

### 3. `unity_catalog`: Deploy UC Resources

Once the workspace is configured, this module provisions the **logical data governance structure**:

- Unity Catalog **catalogs** (e.g., `analytics`, `ml`)
- **Schemas** within those catalogs (e.g., `bronze`, `silver`, `gold`)
- **External locations** backed by the storage credential

All these resources are created using the same workspace-level provider. Permissions and ownership can be layered on top or delegated to additional modules.

---

## 🔐 Dual Provider Strategy

To support both account- and workspace-level operations, the module requires **two provider configurations**:

```hcl
provider "databricks" {
  alias  = "account"
  host   = "https://accounts.azuredatabricks.net"
  account_id = var.account_id
  azure_workspace_resource_id = var.databricks_workspace.resource_id
}

provider "databricks" {
  alias                       = "workspace"
  host                        = var.databricks_workspace.url
  azure_workspace_resource_id = var.databricks_workspace.resource_id
}
```

Each internal module accepts a `providers` block that tells it which scope to use. This design allows flexibility and isolates responsibilities cleanly.
We have set our subscription, client id, and client secret through the following environment variables on the Terraform Cloud Workspace: ARM_SUBSCRIPTION_ID, ARM_CLIENT_ID, ARM_CLIENT_SECRET

---


## 🧾 Example Inputs

Here’s a typical `terraform.tfvars` snippet that matches the actual variable definitions:

```hcl
# Azure
environment       = "dev"
resource_group    = "rg-data-platform"

# Project
asset_name        = "databricks-unity-catalog"
project           = "platform-data"

# Databricks
metastore_id      = "abc123-metastore-id"
account_id        = "abc123-account-id"
admin_groups      = ["admins-group"]
user_groups       = ["users-group"]
access_connector  = "access-connector-name"

storage = {
  account_name   = "datalakeaccount"
  container_name = "uc-container"
}

jdbc_host_name   = "sqlhost.database.windows.net"
jdbc_port        = "1433"
jdbc_database    = "catalogdb"
jdbc_username    = "sqladmin"
jdbc_password    = "supersecret"

key_vault = {
  name = "kv-databricks"
  id   = "/subscriptions/xxx/resourceGroups/rg/providers/Microsoft.KeyVault/vaults/kv-databricks"
  uri  = "https://kv-databricks.vault.azure.net/"
}

databricks_workspace = {
  name        = "my-databricks-workspace"
  id          = "123456"
  resource_id = "/subscriptions/xxx/resourceGroups/rg/providers/Microsoft.Databricks/workspaces/my-databricks-workspace"
  url         = "https://my-databricks-workspace.azuredatabricks.net"
}
```


## 📤 Outputs

After deployment, the module provides:

- `catalog_name`: Name of the primary Unity Catalog
- `catalog_name_external`: Federated catalog (if defined)
- `admins`, `users`, `owners`: Resolved group names for policy enforcement

---

## 🧠 Lessons Learned

- **Separation of concerns matters.** Splitting logic into `account`, `workspace`, and `unity_catalog` lets us test and maintain each piece independently.
- **Provider aliasing is essential.** Without scoped providers, managing cross-domain Databricks resources would be error-prone.
- **Group ID resolution is the secret sauce.** By dynamically resolving group IDs, we avoid brittle hardcoding and enable real IAM integration.

---

## 🛠️ Final Thoughts

This module simplifies the Unity Catalog onboarding experience while enforcing best practices around identity federation and storage governance. Whether you’re setting this up in one workspace or twenty, this design scales.

Want to try it? Clone the repo, plug in your variables, and run:

```bash
terraform init
terraform apply
```

You’ll have Unity Catalog up and running in minutes — with storage credentials, schemas, and catalogs ready to go.
