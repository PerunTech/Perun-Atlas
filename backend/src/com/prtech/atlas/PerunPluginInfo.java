package com.prtech.atlas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.google.gson.JsonObject;
import com.prtech.svarog_interfaces.IPerunPlugin;
import com.prtech.svarog_interfaces.ISvCore;

/**
 * Registers the frontend bundle with svarog so the shell loads its script.
 *
 * perun-atlas is a library rather than a product: it contributes no menu of its
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

	@Override
	public boolean replaceMenuOnNew() {
		return false;
	}

	/**
	 * A library contributes no context menu entries of its own.
	 */
	@Override
	public JsonObject getContextMenu(HashMap<String, String> contextMap, JsonObject existingMenu, ISvCore core) {
		return null;
	}

	@Override
	public boolean replaceContextMenuOnNew() {
		return false;
	}

	/**
	 * The shell resolves this list into a load order: every bundle named here has
	 * its script executed before ours. We call into the spatial engine the moment a
	 * map mounts, so window['spatial'] has to exist by then.
	 *
	 * Consumers of perun-atlas declare "perun-atlas" here in turn -- that
	 * declaration, not an npm entry, is what guarantees the global is populated
	 * before their code runs.
	 */
	@Override
	public List<String> dependencies() {
		List<String> deps = new ArrayList<String>();
		deps.add("spatial");
		return deps;
	}
}
