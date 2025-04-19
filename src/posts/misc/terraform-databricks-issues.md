# Troubleshooting Common Terraform and Databricks Integration Errors

Integrating Terraform with Databricks can streamline infrastructure deployment, but there are common issues that can arise—especially when using Azure Managed Identities (MSI) for authentication. This document outlines two frequently encountered errors and their resolutions.

---

## 1. `context deadline exceeded` on `169.254.169.254`

**Error:**

```
Error: cannot read group: failed during request visitor: inner token: token request: Get "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&client_id=0a000000-a0a0-0aa0-a0a0-0a0a0aa0aa00&resource=0aa0a0a0-0a00-0aa0-a0a0-a0a0a0a0a0a0": context deadline exceeded
```

**Root Cause:**

This error occurs when Terraform attempts to authenticate to Azure using a Managed Identity, but fails to reach the Azure Instance Metadata Service (IMDS) endpoint (`169.254.169.254`), which is only accessible from within an Azure-hosted environment (e.g., virtual machines or hosted agents).

**Resolution:**

Ensure Terraform is being executed within an Azure-hosted environment. Running Terraform from a local machine or outside Azure will not allow access to IMDS, and the MSI flow will fail. Running the same Terraform configuration from an Azure VM or pipeline agent should resolve this issue.

---

## 2. `identity not found` (MSI exists but authentication fails)

**Error:**

```
Error: cannot read group: failed during request visitor: inner token: token request: {"error":"invalid_request","error_description":"Identity not found"}
```

**Root Cause:**

This error typically occurs when using `azure_use_msi = true` in the Databricks provider block. Terraform attempts to acquire a token via the IMDS endpoint, but the request fails with `identity not found`.

This is often due to a missing or mismatched App Registration in Azure Entra ID. The Managed Identity is present, but the corresponding application registration for the requested resource (e.g., Databricks) is either deleted or exists in a different Azure AD tenant.

**Troubleshooting Steps:**

1. Enable Terraform debug logs by setting the environment variable: `TF_LOG=DEBUG`.
2. Re-run the Terraform plan and locate the token request URL:
    ```
    GET /metadata/identity/oauth2/token?api-version=2018-02-01&client_id=...&resource=0aa0a0a0-0a00-0aa0-a0a0-a0a0a0a0a0a0
    ```
3. Identify the `resource` GUID and look it up in Azure Entra ID.
4. Verify that the App Registration for this resource exists in the same tenant as the Managed Identity.

**Resolution:**

- Ensure the Managed Identity for the target resource exists and is not deleted.
- Verify both the Enterprise Application and the Managed Identity reside in the same Azure tenant as the Managed Identity.

**Key Takeaway:**

The presence of an Enterprise Application alone is insufficient — an active Managed Identity must exist within the correct tenant for MSI authentication to succeed.