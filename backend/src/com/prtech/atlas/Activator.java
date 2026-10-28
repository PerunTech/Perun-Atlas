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
import com.prtech.svarog.SvCore;
import com.prtech.svarog.svCONST;
import com.prtech.svarog_interfaces.IPerunPlugin;

// Publishes no web services: the geometry endpoints belong to svarog-spatial, so any deployment with
// spatial installed can use this layer.
public class Activator implements BundleActivator {

	static final Logger log4j = SvConf.getLogger(Activator.class);

	static final String httpContextPath = "/perun-atlas";

	static final String httpLocalDir = "/www";

	private ArrayList<ServiceRegistration> services = new ArrayList<ServiceRegistration>();

	// Unregistering matches on the reference, so stop must see this same instance.
	private final GuiMetadataCallback guiMetadata = new GuiMetadataCallback();

	@SuppressWarnings("rawtypes")
	private ServiceTracker httpTracker;

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void start(BundleContext context) {
		log4j.info("Starting perun-atlas OSGI bundle");

		// Before the plugin service is published, since svarog inserts this bundle's plugin row as it appears.
		SvCore.registerOnSaveCallback(guiMetadata, svCONST.OBJECT_TYPE_PERUN_PLUGIN);

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
		SvCore.unregisterOnSaveCallback(guiMetadata, svCONST.OBJECT_TYPE_PERUN_PLUGIN);

		for (ServiceRegistration svc : services) {
			svc.unregister();
		}
		if (httpTracker != null) {
			httpTracker.close();
		}
	}
}
