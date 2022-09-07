# -*- coding: utf-8 -*-
import cv2
import mediapipe as mp
import numpy as np
import keyboard
import time
from PIL import ImageFont, ImageDraw, Image
from hangul_utils import split_syllable_char, split_syllables, join_jamos

max_num_hands = 2

gesture = {
    0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h',
    8: 'i', 9: 'j', 10: 'k', 11: 'l', 12: 'm', 13: 'n', 14: 'o',
    15: 'p', 16: 'q', 17: 'r', 18: 's', 19: 't', 20: 'u', 21: 'v',
    22: 'w', 23: 'x', 24: 'y', 25: 'z', 26: 'spacing', 27: 'clear',
    28: 'ㄱ', 29: 'ㄴ', 30: 'ㄷ', 31: 'ㄹ', 32: 'ㅁ', 33: 'ㅂ', 34: 'ㅅ', 35: 'ㅇ',
    36: 'ㅈ', 37: 'ㅊ', 38: 'ㅋ', 39: 'ㅌ', 40: 'ㅍ', 41: 'ㅎ', 42: '된소리',
    43: 'ㅏ', 44: 'ㅑ', 45: 'ㅓ', 46: 'ㅕ', 47: 'ㅗ', 48: 'ㅛ', 49: 'ㅜ',
    50: 'ㅠ', 51: 'ㅡ', 52: 'ㅣ', 53: 'ㅐ', 54: 'ㅔ', 55: 'ㅚ', 56: 'ㅟ',
    57: 'ㅚ', 58: 'ㅒ', 59: 'ㅖ', 60: 'ㅢ'
}

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    model_complexity=0,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5)

f = open('test.txt', 'w')

file = np.genfromtxt('dataSet.txt', delimiter=',')
angleFile = file[:, :-1]
labelFile = file[:, -1]
angle = angleFile.astype(np.float32)
label = labelFile.astype(np.float32)
knn = cv2.ml.KNearest_create()
knn.train(angle, cv2.ml.ROW_SAMPLE, label)
cap = cv2.VideoCapture(0 + cv2.CAP_DSHOW)

startTime = time.time()
prev_index = 0
sentence = ''
recognizeDelay = 1

while True:
    ret, img = cap.read()
    if not ret:
        continue
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    result = hands.process(imgRGB)

    if result.multi_hand_landmarks is not None:
        for res in result.multi_hand_landmarks:
            joint = np.zeros((21,3))
            for j, lm in enumerate(res.landmark):
                joint[j] = [lm.x,lm.y,lm.z]

            v1 = joint[[0, 1, 2, 3, 0, 5, 6, 7, 0, 9, 10, 11, 0, 13, 14, 15, 0, 17, 18, 19], :]
            v2 = joint[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], :]
            v = v2 - v1
            print(v)
            print(v.shape)
            print(np.linalg.norm(v, axis=1)[:, np.newaxis])
            print(np.linalg.norm(v, axis=1)[:, np.newaxis].shape)
            v = v / np.linalg.norm(v, axis=1)[:, np.newaxis]
            print(v)
            print(v.shape)
            compareV1 = v[[0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 17], :]
            compareV2 = v[[1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19], :]
            '''
            print(compareV1)
            print(compareV2)
            print(np.einsum('nt,nt->n', compareV1, compareV2))
            print(np.einsum('nt,nt->n', compareV1, compareV2).shape)
            print(np.diag(np.inner(compareV1, compareV2), k=0))
            print(np.inner(compareV1, compareV2).shape)
            '''

            angle = np.arccos(np.einsum('nt,nt->n', compareV1, compareV2))

            angle = np.degrees(angle)
            if keyboard.is_pressed('a'):
                for num in angle:
                    num = round(num, 6)
                    f.write(str(num))
                    f.write(',')
                f.write("60.000000")
                f.write("\n")
                print("next")
            data = np.array([angle], dtype=np.float32)
            ret, results, neighbours, dist = knn.findNearest(data, 3)
            index = int(results[0][0])
            if index in gesture.keys():
                if index != prev_index:
                    startTime = time.time()
                    prev_index = index
                else:
                    if time.time() - startTime > recognizeDelay:
                        if index == 26:
                            sentence += ' '
                        elif index == 27:
                            sentence = ''
                        else:
                            sentence += gesture[index]
                        startTime = time.time()

               # cv2.putText(img, gesture[index].upper(), (int(res.landmark[0].x * img.shape[1] - 10), int(res.landmark[0].y * img.shape[0] + 40)),
               #             cv2.FONT_HERSHEY_SIMPLEX, 1, color=(255,255,255))
            mp_drawing.draw_landmarks(img, res, mp_hands.HAND_CONNECTIONS)

    #cv2.putText(img, sentence,(20,440),cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 3)
    #cv2.imshow('HAND TRACKING', img)
    #cv2.waitKey(1)
    #if keyboard.is_pressed('b'):
    #    break

    font = ImageFont.truetype("fonts/gulim.ttc", 20)
    img = Image.fromarray(img)

    draw = ImageDraw.Draw(img)
    draw.text((20,440), join_jamos(sentence), font=font, fill=(255,255,255))
    draw.text((20,400), sentence, font=font, fill=(255,255,255))
    img = np.array(img)
    cv2.imshow('HAND TRACKING', img)
    cv2.waitKey(1)
    if keyboard.is_pressed('b'):
       break

f.close()
