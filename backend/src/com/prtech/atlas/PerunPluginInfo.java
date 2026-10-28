package com.prtech.atlas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.google.gson.JsonObject;
import com.prtech.svarog_interfaces.IPerunPlugin;
import com.prtech.svarog_interfaces.ISvCore;

// Registers the frontend bundle with svarog so the shell loads its script. A library, so it adds no menu.
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

	@Override
	public JsonObject getMenu(JsonObject existingMenu, ISvCore core) {
		return existingMenu;
	}

	@Override
	public boolean replaceMenuOnNew() {
		return false;
	}

	@Override
	public JsonObject getContextMenu(HashMap<String, String> contextMap, JsonObject existingMenu, ISvCore core) {
		return null;
	}

	@Override
	public boolean replaceContextMenuOnNew() {
		return false;
	}

	// Every bundle named here loads before ours, and a map calls window['spatial'] the moment it mounts.
	@Override
	public List<String> dependencies() {
		List<String> deps = new ArrayList<String>();
		deps.add("spatial");
		return deps;
	}
}
