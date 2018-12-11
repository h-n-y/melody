import { Injectable, Injector, ComponentFactoryResolver, EmbeddedViewRef, ApplicationRef } from '@angular/core';

interface ChildConfig {
    inputs: object,
    outputs: object
}

/**
 * A service for dynamically creating and adding/removing components
 * from the DOM.
 *
 * Used by the ModalService for presenting/dismissing modals.
 *
 * Help for building a modal service ( and this service ) was found at
 * https://itnext.io/angular-create-your-own-modal-boxes-20bb663084a1
 */
@Injectable()
export class DOMService {

    private childComponentRef: any;

    private attachConfig(config, componentRef) {
        let inputs = config.inputs;
        let outputs = config.outputs;
        for ( var key in inputs ) {
            componentRef.instance[key] = inputs[key];
        }
        for ( var key in outputs ) {
            componentRef.instance[key] = outputs[key];
        }
    }

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) { }

    appendComponentTo(parentId: string, child: any, childConfig?: ChildConfig) {
        // Create a component reference from the component
        const childComponentRef = this.componentFactoryResolver
            .resolveComponentFactory(child)
            .create(this.injector);

        // Attach the config to the child ( inputs and outputs )
        this.attachConfig(childConfig, childComponentRef);

        this.childComponentRef = childComponentRef;
        // Attach the component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(childComponentRef.hostView);

        // Get DOM element from component
        const childDomElem = ( childComponentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // Append DOM element to the body
        document.getElementById(parentId).appendChild(childDomElem);
    }

    removeComponent() {
        this.appRef.detachView(this.childComponentRef.hostView);
        this.childComponentRef.destroy();
    }
}
