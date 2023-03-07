import numpy as np
import cv2
import os, sys
import re

# -------------------- Utility function ------------------------
def normalize_label(str_):
  str_ = str_.replace(" ", "")
  str_ = str_.translate(str_.maketrans("","", "()"))
  str_ = str_.split("_")
  return ''.join(str_[:2])

def normalize_desc(folder):
  text = folder + " - "
  text = re.sub(r'\d+', '', text)
  text = text.replace(".", "")
  text = text.strip()
  return text

from skimage.feature import graycomatrix, graycoprops
# from skimage.feature.graycoprops

def calc_glcm_all_agls(img, props, dists=[5], agls=[0, np.pi/4, np.pi/2, 3*np.pi/4], lvl=256, sym=True, norm=True):
  glcm = graycomatrix(img, distances=dists,  angles=agls, levels=lvl, symmetric=sym, normed=norm)
  feature = []
  glcm_props = [propery for name in props for propery in graycoprops(glcm, name)[0]]
  for item in glcm_props:
    feature.append(item)
  return feature

# -------------------- Load Dataset ------------------------

dataset_dir = "uploads"

imgs = []
filename = sys.argv[1]
img = cv2.imread(os.path.join(dataset_dir, filename))
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

h, w = gray.shape
ymin, ymax, xmin, xmax = h//3, h*2//3, w//3, w*2//3
crop = gray[ymin:ymax, xmin:xmax]

resize = cv2.resize(crop, (0,0), fx=0.5, fy=0.5)
imgs.append(resize)

from skimage.feature import graycomatrix, graycoprops

# ----------------- call calc_glcm_all_agls() for all properties ----------------------------------

# properties = ['dissimilarity', 'correlation', 'homogeneity', 'contrast', 'ASM', 'energy']
properties = ['contrast', 'energy', 'homogeneity']

# result = calc_glcm_all_agls(resize, props=properties)
result = calc_glcm_all_agls(gray, props=properties)
print(result)
