package com.prtech.atlas;

import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.ISvOnSave;

/**
 * Keeps SVAROG_PERUN_PLUGIN.GUI_METADATA for this bundle stamped with
 * cardHidden = true.
 *
 * movement-atlas is a library, not a product: it registers no routes, so
 * ModuleMenu already declines to draw a card for it. PerunNavbar's burger menu
 * has no such check though -- it tests cardHidden alone -- so without this the
 * bundle shows up there as a link to /main/movement-atlas that resolves to
 * nothing.
 *
 * GUI_METADATA is not part of IPerunPlugin, so a plugin has no way to declare
 * its own. Nothing in svarog writes the column either: buildDboPlugin populates
 * nine fields and leaves this one null, which means a fresh install is visible
 * until an administrator edits the row by hand. Registering here instead of
 * asking svarog for an interface method keeps the change inside this bundle.
 *
 * SvWriter runs on-save callbacks against the live object just before it is
 * batched for writing, so setting the value here is what reaches the database.
 */
public class GuiMetadataCallback implements ISvOnSave {

	private static final Logger log4j = SvConf.getLogger(GuiMetadataCallback.class);

	/** Unique column on SVAROG_PERUN_PLUGIN; not exposed as an Sv constant. */
	private static final String CONTEXT_NAME = "CONTEXT_NAME";

	/** Key read by WsConf.cardIsHidden when it builds the module payload. */
	private static final String CARD_HIDDEN = "cardHidden";

	/**
	 * The callback list is registered per object type, so only plugin rows arrive
	 * here -- but every bundle's row does. Anything that is not ours is left
	 * exactly as it came in.
	 */
	@Override
	public boolean beforeSave(SvCore parentCore, DbDataObject dbo) {
		try {
			String context = Activator.httpContextPath.replace("/", "");
			if (!context.equals(dbo.getVal(CONTEXT_NAME)))
				return true;

			JsonObject meta = readMetadata(dbo);
			meta.addProperty(CARD_HIDDEN, true);

			// Written as a string: the column is NVARCHAR(2000) and every reader
			// handles the string form first. svarog itself hands this field around as
			// a parsed JsonObject once it has been loaded, so normalising on the way
			// out keeps what lands in the database predictable.
			dbo.setVal(Sv.GUI_METADATA, meta.toString());
		} catch (Exception e) {
			// Never abort a plugin registration over card visibility.
			log4j.error("Failed stamping " + CARD_HIDDEN + " on the movement-atlas plugin row", e);
		}
		return true;
	}

	@Override
	public void afterSave(SvCore parentCore, DbDataObject dbo) {
		// Nothing to clean up.
	}

	/**
	 * Reads the existing metadata so the stamp merges rather than replaces.
	 *
	 * The blob is shared: cardHidden lives beside hasPersistReducer, directAccess
	 * and accessGroup, the last two of which an administrator owns. Overwriting it
	 * wholesale would silently drop their access configuration.
	 *
	 * @return the current metadata, or an empty object when there is none
	 */
	private JsonObject readMetadata(DbDataObject dbo) {
		Object raw = dbo.getVal(Sv.GUI_METADATA);

		if (raw instanceof JsonObject)
			return (JsonObject) raw;

		if (raw instanceof String && !((String) raw).trim().isEmpty()) {
			try {
				JsonObject parsed = (new Gson()).fromJson((String) raw, JsonObject.class);
				if (parsed != null)
					return parsed;
			} catch (Exception e) {
				// An unparseable blob is already inert -- WsConf logs and falls back to
				// false for every key it holds -- so starting fresh loses no working
				// configuration. Logged loudly because it points at a bad manual edit.
				log4j.warn("Discarding unparseable GUI_METADATA on the movement-atlas plugin row: " + raw, e);
			}
		}

		return new JsonObject();
	}
}
