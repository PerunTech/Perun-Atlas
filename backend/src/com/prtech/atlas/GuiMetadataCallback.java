package com.prtech.atlas;

import org.apache.logging.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import com.prtech.svarog.Sv;
import com.prtech.svarog.SvConf;
import com.prtech.svarog.SvCore;
import com.prtech.svarog_common.DbDataObject;
import com.prtech.svarog_common.ISvOnSave;

// Stamps cardHidden = true on this bundle's GUI_METADATA. PerunNavbar's burger menu checks only
// cardHidden and nothing in svarog writes the column, so a fresh install would list a dead link.
public class GuiMetadataCallback implements ISvOnSave {

	private static final Logger log4j = SvConf.getLogger(GuiMetadataCallback.class);

	/** Unique column on SVAROG_PERUN_PLUGIN; not exposed as an Sv constant. */
	private static final String CONTEXT_NAME = "CONTEXT_NAME";

	/** Key read by WsConf.cardIsHidden when it builds the module payload. */
	private static final String CARD_HIDDEN = "cardHidden";

	// Every bundle's plugin row arrives here; anything not ours is left as it came.
	@Override
	public boolean beforeSave(SvCore parentCore, DbDataObject dbo) {
		try {
			String context = Activator.httpContextPath.replace("/", "");
			if (!context.equals(dbo.getVal(CONTEXT_NAME)))
				return true;

			JsonObject meta = readMetadata(dbo);
			meta.addProperty(CARD_HIDDEN, true);

			// A string, which every reader handles first; svarog passes it around parsed once loaded.
			dbo.setVal(Sv.GUI_METADATA, meta.toString());
		} catch (Exception e) {
			// Never abort a plugin registration over card visibility.
			log4j.error("Failed stamping " + CARD_HIDDEN + " on the perun-atlas plugin row", e);
		}
		return true;
	}

	@Override
	public void afterSave(SvCore parentCore, DbDataObject dbo) {
		// Nothing to clean up.
	}

	// Merges rather than replaces: directAccess and accessGroup in the same blob are an administrator's.
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
				// Already inert, so starting fresh loses nothing; it points at a bad manual edit.
				log4j.warn("Discarding unparseable GUI_METADATA on the perun-atlas plugin row: " + raw, e);
			}
		}

		return new JsonObject();
	}
}
