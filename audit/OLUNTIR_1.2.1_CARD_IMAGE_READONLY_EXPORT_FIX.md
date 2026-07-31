# Oluntir 1.2.1 – Card image read-only export fix

## Symptom
During the black export progress overlay, the visible page changed and newly selected card images disappeared. The exported HTML/SSI no longer contained the images.

## Cause
The export iterated through pages by selecting them in the live editor canvas. It then synchronized rendered canvas image references back into the GrapesJS model and normalized stable paths before automatically storing the project. A page whose uploaded assets had not yet been rehydrated in the canvas could therefore overwrite a valid persistent image state.

## Correction
- Serialize every page directly from `page.getMainComponent()`.
- Do not select pages during export.
- Do not synchronize canvas DOM references into the model during export.
- Do not normalize or automatically store the open project during export.
- Continue mapping blob URLs to stable paths only inside the temporary exported HTML string.

The export is now a read-only operation.
