package com.prtech.atlas;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.logging.log4j.Logger;

import com.prtech.svarog.SvConf;

/**
 * Build-time project metadata, filtered into atlas.properties by Maven.
 */
public class Config {
	private static final Logger log = SvConf.getLogger(Config.class);

	private static final Properties properties = loadProperties();

	private static Properties loadProperties() {
		Properties properties = new Properties();
		InputStream is = Config.class.getClassLoader().getResourceAsStream("atlas.properties");

		try {
			properties.load(is);
		} catch (IOException e) {
			log.error("Failed loading configuration.");
			log.error(e);
		} finally {
			try {
				if (is != null)
					is.close();
			} catch (IOException ioe) {
				log.error(ioe);
			}
		}

		return properties;
	}

	static String getProjectGroup() {
		return properties.getProperty("projectGroup", "");
	}

	static String getProjectName() {
		return properties.getProperty("projectName", "perun-atlas");
	}

	static String getProjectVersion() {
		return properties.getProperty("version", "1");
	}

	static String getDescription() {
		return properties.getProperty("description", "");
	}

	static String getJSURL() {
		return properties.getProperty("url", "");
	}

	static String getPermissionCode() {
		return properties.getProperty("permissionCode", "yes");
	}

	static String getCardIcon() {
		return properties.getProperty("icon", "");
	}

	static String getCardLabel() {
		return properties.getProperty("label", "");
	}

	static String getCardOrder() {
		return properties.getProperty("sortOrder", "");
	}
}
