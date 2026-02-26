from PIL import Image, ImageDraw, ImageFont
import os

# Paths
LOGO_PATH = '/Users/ankumar/basal/landing/public/new-statis-logo.png'
OUTPUT_PATH = '/Users/ankumar/basal/docs/images/readme-banner.png'

# Settings
BANNER_WIDTH = 1200
BANNER_HEIGHT = 400
BG_COLOR = "#ffffff"  # Light theme to match new branding
TEXT_COLOR = "#0f172a" # Slate-900 
SUBTEXT_COLOR = "#64748b" # Slate-500

def create_banner():
    # 1. Create base canvas
    banner = Image.new('RGBA', (BANNER_WIDTH, BANNER_HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(banner)
    
    # Optional: Draw subtle grid pattern
    grid_color = "#f1f5f9" # Slate-100
    grid_size = 40
    for x in range(0, BANNER_WIDTH, grid_size):
        draw.line([(x, 0), (x, BANNER_HEIGHT)], fill=grid_color, width=1)
    for y in range(0, BANNER_HEIGHT, grid_size):
        draw.line([(0, y), (BANNER_WIDTH, y)], fill=grid_color, width=1)
        
    try:
        # 2. Add logo (left aligned)
        logo = Image.open(LOGO_PATH).convert("RGBA")
        
        # Calculate size to fit reasonably
        target_height = 240
        aspect_ratio = logo.width / logo.height
        target_width = int(target_height * aspect_ratio)
        
        logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Position logic
        # Center block = Logo + Gap + Text 
        
        # Load fonts (using default if custom not found, but trying to use system sans-serif)
        try:
            head_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
            sub_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
        except:
            head_font = ImageFont.load_default()
            sub_font = ImageFont.load_default()
            
        # Hardcoding the text dimensions for simplicity since getsize is deprecated
        # Helvetica 72: STATIS ~ 250px wide
        # Helvetica 32: The Semantic Event Bus... ~ 400px wide
        
        gap = 40
        
        logo_x = 200
        logo_y = (BANNER_HEIGHT - target_height) // 2
        
        text_x = logo_x + target_width + gap
        
        # 3. Paste Logo
        # Use logo as its own mask to preserve transparency
        banner.paste(logo, (logo_x, logo_y), mask=logo)
        
        # 4. Draw Text
        draw.text((text_x, logo_y + 60), "STATIS", font=head_font, fill=TEXT_COLOR)
        draw.text((text_x, logo_y + 140), "The State Layer for AI Agents", font=sub_font, fill=SUBTEXT_COLOR)
        
        # 5. Save
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        banner.save(OUTPUT_PATH, "PNG")
        print(f"✅ Successfully created banner at {OUTPUT_PATH}")
        
    except Exception as e:
        print(f"❌ Error creating banner: {e}")

if __name__ == "__main__":
    create_banner()
