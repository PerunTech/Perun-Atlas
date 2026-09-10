package com.prtech.atlas;

import java.util.ArrayList;

import org.apache.logging.log4j.Logger;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.http.HttpService;
import org.osgi.util.tracker.ServiceTracker;

import com.prtech.svarog.SvConf;
import com.prtech.svarog_interfaces.IPerunPlugin;

/**
 * Bundle lifecycle for movement-atlas.
 *
 * This bundle serves static assets and registers itself as a Perun plugin. It
 * publishes no web services: the geometry endpoints it consumes belong to
 * svarog-spatial, and keeping them there is what lets any deployment with spatial
 * installed use this layer without a product-specific backend.
 */
public class Activator implements BundleActivator {

	static final Logger log4j = SvConf.getLogger(Activator.class);

	/** Context path under which the bundle's /www folder is served. */
	static final String httpContextPath = "/movement-atlas";

	/** Directory inside the bundle served at the context path. */
	static final String httpLocalDir = "/www";

	private ArrayList<ServiceRegistration> services = new ArrayList<ServiceRegistration>();

	@SuppressWarnings("rawtypes")
	private ServiceTracker httpTracker;

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void start(BundleContext context) {
		log4j.info("Starting movement-atlas OSGI bundle");

		IPerunPlugin publisher = new PerunPluginInfo();
		log4j.info("Registering " + Config.getDescription() + " plugin with Svarog");
		services.add(context.registerService(IPerunPlugin.class.getName(), publisher, null));

		httpTracker = new ServiceTracker(context, HttpService.class.getName(), null) {
			public void removedService(ServiceReference reference, Object service) {
				try {
					((HttpService) service).unregister(httpContextPath);
				} catch (IllegalArgumentException exception) {
					// Registration probably failed earlier on; nothing to unwind.
				}
			}

			public Object addingService(ServiceReference reference) {
				HttpService httpService = (HttpService) this.context.getService(reference);
				try {
					httpService.registerResources(httpContextPath, httpLocalDir, null);
				} catch (Exception exception) {
					log4j.error("Failed registering static resources", exception);
				}
				return httpService;
			}
		};

		httpTracker.open();
	}

	public void stop(BundleContext context) throws Exception {
		for (ServiceRegistration svc : services) {
			svc.unregister();
		}
		if (httpTracker != null) {
			httpTracker.close();
		}
	}
}
