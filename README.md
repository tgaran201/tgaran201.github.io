# Gallery photos

The gallery on the site expects 8 photos named exactly:

photo1.jpg
photo2.jpg
photo3.jpg
photo4.jpg
photo5.jpg
photo6.jpg
photo7.jpg
photo8.jpg

Right now these are soft placeholder gradients so the layout has something
to show. To use your real photos:

1. Rename your chosen photos to match the list above (keep the .jpg
   extension, or update the file extension referenced in index.html if
   you're using .png/.jpeg instead).
2. Drop them into this `images/` folder, overwriting the placeholders.
3. Recommended size: roughly 1200px on the longest side, landscape or
   portrait both work — the gallery crops to fit each frame automatically.

Want more or fewer than 8 photos? Add or remove `<div class="g-item ...">`
blocks in the gallery section of index.html, and update the `src="images/
photoN.jpg"` path on each one to match.
