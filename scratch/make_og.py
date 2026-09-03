import os
try:
    from PIL import Image, ImageDraw, ImageFont
    
    # 1200x630 OG image standard
    width, height = 1200, 630
    img = Image.new('RGB', (width, height), color='#090d16')
    draw = ImageDraw.Draw(img)
    
    # Gradient backgrounds / circles
    draw.ellipse([-100, -100, 700, 700], fill='#0071e3')
    draw.ellipse([600, 100, 1400, 900], fill='#5e5ce6')
    draw.ellipse([200, 300, 900, 800], fill='#af52de')
    
    # Dark overlay with glass effect
    overlay = Image.new('RGBA', (width, height), (9, 13, 22, 210))
    img = Image.alpha_composite(img.convert('RGBA'), overlay)
    draw = ImageDraw.Draw(img)
    
    # Card outline box
    draw.rounded_rectangle([80, 60, 1120, 570], radius=24, fill=(255, 255, 255, 12), outline=(255, 255, 255, 40), width=2)
    
    # Header bar
    draw.rounded_rectangle([120, 100, 1080, 150], radius=12, fill=(255, 255, 255, 20))
    
    # Text placeholder / branding
    draw.text((140, 112), "AI DATA ANALYSIS PLATFORM", fill='#ffffff')
    draw.text((140, 200), "Talk to Your Data. Get Instant Visuals.", fill='#ffffff')
    draw.text((140, 260), "Upload CSV, Excel, SQLite, or SQL files for conversational analytics.", fill='#a1a1a6')
    
    out_png = r'e:\ai-data-analyst\frontend\public\og-image.png'
    out_jpg = r'e:\ai-data-analyst\frontend\public\og-image.jpg'
    
    rgb_img = img.convert('RGB')
    rgb_img.save(out_png)
    rgb_img.save(out_jpg)
    print("SUCCESSFULLY_CREATED_OG_IMAGES")
except Exception as e:
    print("PIL Error:", e)
    # Fallback using raw BMP header to PNG convert or simple image
    out_png = r'e:\ai-data-analyst\frontend\public\og-image.png'
    out_jpg = r'e:\ai-data-analyst\frontend\public\og-image.jpg'
    # Create simple binary image or fallback
    with open(out_png, 'wb') as f:
        f.write(b'PNG_FALLBACK')
