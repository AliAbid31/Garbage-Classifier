from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io

def load_model():
    print("Model loading...")
    checkpoint = torch.load('garbage_classifier.pth', map_location=torch.device('cpu'))
    
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 6)
    
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval() 
    
    return model, checkpoint['classes']

model, class_names = load_model()
print(f"Model loaded ! Classes : {class_names}")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Le serveur IA est en ligne 🟢"}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    
    tensor = transform(image).unsqueeze(0) 
    
    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        top_prob, top_class = probs.topk(1, dim=1)
    
    predicted_label = class_names[top_class.item()]
    confidence = round(top_prob.item() * 100, 2)
    
    return {
        "class": predicted_label,
        "confidence": confidence
    }