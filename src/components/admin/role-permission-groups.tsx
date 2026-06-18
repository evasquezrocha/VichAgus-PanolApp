import {
  PERMISSION_LABELS,
  type AppPermission,
  type PermissionGroupDefinition,
} from "@/types/permission";

type RolePermissionGroupsProps = {
  groups: PermissionGroupDefinition[];
  selectedPermissions: AppPermission[];
  disabled?: boolean;
  inputName?: string;
};

export function RolePermissionGroups({
  groups,
  selectedPermissions,
  disabled = false,
  inputName = "permissions",
}: RolePermissionGroupsProps) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section
          key={group.id}
          className="rounded-2xl border border-line bg-white/45 p-4"
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              {group.label}
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {group.permissions.map((permission) => (
              <label
                key={`${group.id}-${permission}`}
                className={[
                  "flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 transition",
                  disabled ? "opacity-70" : "",
                ].join(" ")}
              >
                <input
                  className="h-4 w-4 accent-[#2b3a44]"
                  defaultChecked={selectedPermissions.includes(permission)}
                  disabled={disabled}
                  name={inputName}
                  type="checkbox"
                  value={permission}
                />
                <span className="text-sm">{PERMISSION_LABELS[permission]}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
