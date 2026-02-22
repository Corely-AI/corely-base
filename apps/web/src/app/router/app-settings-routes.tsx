import React from "react";
import { Navigate, Route } from "react-router-dom";
import { SettingsPage, RolesPage, RolePermissionsPage } from "../../modules/settings";
import DimensionsSettingsPage from "../../modules/settings/screens/DimensionsSettingsPage";
import CustomFieldsSettingsPage from "../../modules/settings/screens/CustomFieldsSettingsPage";
import { RequirePermission } from "../../modules/settings/components/RequirePermission";
import { RequireCapability } from "../../shared/workspaces/RequireCapability";
import { WorkspaceMembersPage, WorkspaceSettingsPage } from "../../modules/workspaces";

export const appSettingsRoutes = (
  <>
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/settings/workspace" element={<WorkspaceSettingsPage />} />
    <Route path="/settings/custom-attributes/dimensions" element={<DimensionsSettingsPage />} />
    <Route
      path="/settings/custom-attributes/custom-fields"
      element={<CustomFieldsSettingsPage />}
    />
    <Route
      path="/settings/members"
      element={
        <RequireCapability capability="workspace.multiUser">
          <WorkspaceMembersPage />
        </RequireCapability>
      }
    />
    <Route
      path="/settings/roles"
      element={
        <RequireCapability capability="workspace.rbac">
          <RequirePermission permission="settings.roles.manage">
            <RolesPage />
          </RequirePermission>
        </RequireCapability>
      }
    />
    <Route
      path="/settings/roles/:roleId/permissions"
      element={
        <RequireCapability capability="workspace.rbac">
          <RequirePermission permission="settings.roles.manage">
            <RolePermissionsPage />
          </RequirePermission>
        </RequireCapability>
      }
    />
  </>
);
