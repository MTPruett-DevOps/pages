# Solving Databricks Access at Scale: No Consolidation Required

We originally considered consolidating Databricks workspaces — thinking a shared DEV, QA, UAT, and PROD stack would reduce overhead. But after digging in, we realized that **workspace isolation still provides value** for many of our teams.

So instead of changing the architecture, we're improving how it's managed.

---

## The Problem

With dozens of Databricks workspaces across teams and environments, the real pain hasn’t been the number of stacks — it's been **managing identity and permissions** consistently.

Each workspace has its own ACLs, user groups, and manual assignment processes. There’s no centralized control, and onboarding new users means touching every environment manually.

That doesn’t scale.

---

## The New Plan

We’re rolling out **automatic identity management**, using Terraform and Azure Entra ID (formerly Azure AD) as the source of truth.

### ✅ What We're Doing

- Keeping existing workspace-per-team architecture
- Managing permissions centrally through **Entra ID groups**
- Using Terraform to assign those groups in Databricks (via `databricks_group` + `databricks_permission_assignment`)
- Supporting both admin and user roles per environment

This allows us to **delegate access control to Entra ID**, while ensuring it's reflected consistently across all Databricks workspaces — without manual setup.

---

## 🔐 What Is Automatic Identity Management — and Why It Matters

**Automatic identity management** lets you seamlessly use Microsoft Entra ID (formerly Azure AD) as the authoritative source for all identity in Azure Databricks — without needing to register or configure a separate enterprise application.

When enabled:

- You can directly **search and assign Entra ID users, groups, and service principals** inside your Databricks workspace.
- **No manual SCIM syncs** or application provisioning required.
- **Group membership is dynamic** — changes made in Entra ID (e.g. adding a user to a group) are automatically reflected in Databricks.
- **Nested groups work**, allowing more scalable and flexible access models.

---

### 🔁 Why This Replaces Our Current SCIM Setup

Right now, we're using a **SCIM connector**, which requires:

- Manually assigning groups to the Databricks SCIM enterprise application in Azure
- Waiting for Azure to sync those groups into the workspace
- **No support for nested groups**, meaning we often duplicate group assignments or flatten group hierarchies manually

This doesn't scale, especially with many teams and complex access models.

With **automatic identity management**, that overhead goes away:

✅ No app assignments or SCIM syncs  
✅ Nested groups work out of the box  
✅ Entra ID remains the source of truth  
✅ Group changes are reflected automatically in Databricks

---

## Why This Works

- **No change to team autonomy:**  
  Teams keep their own workspaces and deployments.

- **Centralized identity management:**  
  All permission logic is driven by Entra ID.

- **Infra-as-Code enforcement:**  
  Terraform ensures access is applied consistently across all environments.

- **Scales cleanly:**  
  Adding a new team? Just create an Entra group and run a plan.

---

## The Tradeoffs

- Still multiple workspaces to maintain — but worth it for team-level isolation.
- Requires governance around Entra ID group structure and naming.
- Teams need to follow group-based access patterns for Databricks.

---

## Summary

We’re not reducing workspaces — we’re reducing effort.  
Automatic identity management gives us secure, scalable access control across all Databricks environments, without touching every workspace manually.