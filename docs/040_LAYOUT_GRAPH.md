# Layout Graph

Oluntir 1.2.1 models page structure as a tolerant graph: Page → Section → Row → Slot → Component. The graph is derived from the GrapesJS component tree and never replaces it. Missing levels are valid. Bootstrap `.row` and `col-*` classes are recognized without changing classes or markup.

Persistent relationships live on GrapesJS components through internal `data-oluntir-*-id` attributes. The page identity is also stored on the GrapesJS page model as `oluntirPageId`. The canvas DOM is only a rendered view.
