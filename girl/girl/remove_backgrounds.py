from pathlib import Path
from rembg import remove
from PIL import Image

input_folder = Path(".")
output_folder = input_folder / "no_bg"
output_folder.mkdir(exist_ok=True)

extensions = [".png", ".jpg", ".jpeg", ".webp"]

for file in input_folder.iterdir():
    if file.suffix.lower() in extensions and file.parent.name != "no_bg":
        print(f"Processing: {file.name}")
        img = Image.open(file).convert("RGBA")
        result = remove(img)
        output_path = output_folder / f"{file.stem}.png"
        result.save(output_path)

print("Done. Check the no_bg folder.")
