package com.prtech.atlas;

import com.google.gson.JsonObject;
import com.prtech.svarog_interfaces.IPerunPlugin;
import com.prtech.svarog_interfaces.ISvCore;

/**
 * Registers the frontend bundle with svarog so the shell loads its script.
 *
 * movement-atlas is a library rather than a product: it contributes no menu of its
 * own, and consumers embed its components. getMenu therefore returns the existing
 * menu untouched.
 */
public class PerunPluginInfo implements IPerunPlugin {

	private static int pluginVersion = 1;

	@Override
	public int getVersion() {
		return pluginVersion;
	}

	@Override
	public String getContextName() {
		return Activator.httpContextPath.replace("/", "");
	}

	@Override
	public String getJsPluginUrl() {
		return Config.getJSURL();
	}

	@Override
	public String getIconPath() {
		return Config.getCardIcon();
	}

	@Override
	public String getLabelCode() {
		return Config.getCardLabel();
	}

	@Override
	public String getPermissionCode() {
		return Config.getPermissionCode();
	}

	@Override
	public int getSortOrder() {
		return Integer.parseInt(Config.getCardOrder());
	}

	/**
	 * A library contributes no menu entries of its own.
	 */
	@Override
	public JsonObject getMenu(JsonObject existingMenu, ISvCore core) {
		return existingMenu;
	}
}
