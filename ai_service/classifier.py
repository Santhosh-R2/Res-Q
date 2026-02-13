import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image
import io

class DisasterClassifier:
    def __init__(self):
        # Load pre-trained ResNet50
        self.weights = ResNet50_Weights.DEFAULT
        self.model = resnet50(weights=self.weights)
        self.model.eval()
        self.categories = self.weights.meta["categories"]
        
        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # Enhanced mapping for disaster types
        self.disaster_mapping = {
            'Fire': ['fire', 'flame', 'smoke', 'fire_engine', 'volcano', 'stove', 'candle', 'matchstick'],
            'Flood': ['water', 'lake', 'ocean', 'river', 'boat', 'canoe', 'dam', 'rain', 'puddle', 'seashore', 'fountain'],
            'Medical': ['ambulance', 'stretcher', 'medicine', 'hospital', 'pill', 'syringe', 'mask'],
            'Collapse': ['rubble', 'brick', 'wall', 'ruin', 'stone', 'rock', 'concrete', 'cliff'],
            'Violence': ['gun', 'pistol', 'rifle', 'weapon', 'police', 'soldier', 'military'],
        }

    def predict(self, image_bytes):
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_t = self.preprocess(img)
        batch_t = torch.unsqueeze(img_t, 0)

        with torch.no_grad():
            output = self.model(batch_t)
        
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        top5_prob, top5_catid = torch.topk(probabilities, 5)

        predictions = []
        detected_disaster = 'Other'

        for i in range(top5_prob.size(0)):
            category = self.categories[top5_catid[i]]
            score = top5_prob[i].item()
            predictions.append({'category': category, 'score': score})
            
            # Check if this category matches a disaster type
            if detected_disaster == 'Other':
                cat_lower = category.lower()
                for d_type, keywords in self.disaster_mapping.items():
                    if any(kw in cat_lower for kw in keywords):
                        detected_disaster = d_type
                        break

        return {
            'disaster_type': detected_disaster,
            'top_prediction': predictions[0]['category'],
            'confidence': predictions[0]['score'],
            'all_predictions': predictions
        }

classifier = DisasterClassifier()
