// Importing the required libraries and modules.
// @lit-labs/ssr provides server-side rendering capabilities for lit components.
import { render } from "@lit-labs/ssr";

// html is a tagged template function from the `lit` library to define lit-html templates.
import { html } from "lit";

// unsafeHTML is a directive for rendering raw HTML strings in lit-html templates.
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

// makeDebug is a function to create debug loggers.
import makeDebug from "debug";
// Creating a debugger specific to "componium:frontend-renderer".
const debug = makeDebug("componium:frontend-renderer");

/**
 * Renderer class is responsible for rendering lit components in a server-side context.
 */
class Renderer {
  /**
   * Constructor for the Renderer class.
   * @param {string} name - The name of the component being rendered.
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Renders a given lit component along with necessary scripts and styles.
   *
   * @param {Function} component - The lit component to render.
   * @param {Object} request - The express.js request object.
   * @param {Object} response - The express.js response object.
   * @param {Object} options - Options for rendering like title.
   * @returns {Promise<unknown>} - The rendered HTML as a promise.
   */
  async render(component, request, response, options) {
    // Constructing the title tag using the provided options.
    const title = `<title>${options.title}</title>`;
    // Defining the entry point for the component's script.
    const entrypoint = `<script type="module">await import("/components/${this.name}.js");</script>`;
    debug(`Entrypoint file ${entrypoint}`);
    // Invoking the provided component function to get the component's render result.
    const componentRender =
      component !== null ? component(request, response) : "";

    // Rendering the complete HTML including the component, styles, and scripts.
    return render(html`
      <!DOCTYPE html>
      <html>
        <head>
          ${unsafeHTML(title)}
          <!-- Dynamically insert the title -->
        </head>
        <style>
          /* Styles to hide the body content until the component is ready. */
          body[dsd-pending] {
            display: none;
          }
        </style>
        <body dsd-pending>
          <script type="importmap">
            {
              "imports": {
                /* Define the import map for modules to provide URL mappings. */
                ... // [list of import mappings]
              }
            }
          </script>
          <script>
            // Check for native declarative shadow DOM support.
            // If supported, reveal the body content immediately.
            if (HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot")) {
              document.body.removeAttribute("dsd-pending");
            }
          </script>
          ${unsafeHTML(componentRender)}
          <!-- Dynamically render the component -->
          <script type="module">
            // Importing hydration support for lit components.
            await import("/_framework/lit-element-hydrate-support.js");
          </script>

          ${unsafeHTML(entrypoint)}
          <!-- Insert the component entry point script -->
        </body>
      </html>
    `);
  }
}

// Exporting the Renderer class for external use.
export { Renderer };
