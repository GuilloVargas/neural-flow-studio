import { Injectable } from '@angular/core';

import { TrainingData } from './tfjs.service';

export interface DatasetDefinition {
  id: string;
  name: string;
  description: string;
  source: string;
  inputShape: number[];
  outputClasses: number;
  defaultSamples: number;
  maxSamples: number;
  template: 'dense-classifier' | 'cnn-classifier';
  splitOffset: number;
  kind: 'mnist' | 'iris' | 'boston-housing';
  outputActivation: string;
  loss: string;
  metrics: string[];
}

export interface LoadedDataset {
  definition: DatasetDefinition;
  data: TrainingData;
}

const MNIST_IMAGE_WIDTH = 28;
const MNIST_IMAGE_HEIGHT = 28;
const MNIST_IMAGE_SIZE = MNIST_IMAGE_WIDTH * MNIST_IMAGE_HEIGHT;
const MNIST_CLASSES = 10;
const MNIST_TRAIN_ELEMENTS = 55000;
const MNIST_TEST_ELEMENTS = 10000;
const MNIST_IMAGES_SPRITE_PATH =
  'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
const MNIST_LABELS_PATH =
  'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';
const IRIS_TRAIN_PATH = 'https://storage.googleapis.com/download.tensorflow.org/data/iris_training.csv';
const IRIS_TEST_PATH = 'https://storage.googleapis.com/download.tensorflow.org/data/iris_test.csv';
const BOSTON_TRAIN_PATH =
  'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv';
const BOSTON_TEST_PATH =
  'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-test.csv';

@Injectable({ providedIn: 'root' })
export class DatasetService {
  readonly datasets: DatasetDefinition[] = [
    {
      id: 'mnist-train',
      name: 'MNIST digits - train',
      description: 'Digitos manuscritos 28x28 en escala de grises, labels one-hot de 0 a 9.',
      source: 'TensorFlow.js examples',
      inputShape: [28, 28, 1],
      outputClasses: 10,
      defaultSamples: 1000,
      maxSamples: MNIST_TRAIN_ELEMENTS,
      template: 'cnn-classifier',
      splitOffset: 0,
      kind: 'mnist',
      outputActivation: 'softmax',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    },
    {
      id: 'mnist-test',
      name: 'MNIST digits - test',
      description: 'Split de prueba de MNIST para validaciones rapidas con la misma forma 28x28x1.',
      source: 'TensorFlow.js examples',
      inputShape: [28, 28, 1],
      outputClasses: 10,
      defaultSamples: 1000,
      maxSamples: MNIST_TEST_ELEMENTS,
      template: 'cnn-classifier',
      splitOffset: MNIST_TRAIN_ELEMENTS,
      kind: 'mnist',
      outputActivation: 'softmax',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    },
    {
      id: 'iris-train',
      name: 'Iris flowers - train',
      description: 'Clasificacion de flores Iris con 4 features numericas y 3 clases.',
      source: 'TensorFlow sample data',
      inputShape: [4],
      outputClasses: 3,
      defaultSamples: 120,
      maxSamples: 120,
      template: 'dense-classifier',
      splitOffset: 0,
      kind: 'iris',
      outputActivation: 'softmax',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    },
    {
      id: 'iris-test',
      name: 'Iris flowers - test',
      description: 'Split de prueba de Iris con 30 ejemplos para validaciones rapidas.',
      source: 'TensorFlow sample data',
      inputShape: [4],
      outputClasses: 3,
      defaultSamples: 30,
      maxSamples: 30,
      template: 'dense-classifier',
      splitOffset: 0,
      kind: 'iris',
      outputActivation: 'softmax',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    },
    {
      id: 'boston-housing-train',
      name: 'Boston Housing - train',
      description: 'Regresion tabular de precio medio de vivienda con 12 features normalizadas.',
      source: 'TensorFlow.js examples',
      inputShape: [12],
      outputClasses: 1,
      defaultSamples: 333,
      maxSamples: 333,
      template: 'dense-classifier',
      splitOffset: 0,
      kind: 'boston-housing',
      outputActivation: 'linear',
      loss: 'meanSquaredError',
      metrics: [],
    },
    {
      id: 'boston-housing-test',
      name: 'Boston Housing - test',
      description: 'Split de prueba de Boston Housing con features normalizadas y objetivo escalado.',
      source: 'TensorFlow.js examples',
      inputShape: [12],
      outputClasses: 1,
      defaultSamples: 173,
      maxSamples: 173,
      template: 'dense-classifier',
      splitOffset: 0,
      kind: 'boston-housing',
      outputActivation: 'linear',
      loss: 'meanSquaredError',
      metrics: [],
    },
  ];

  async loadDataset(datasetId: string, samples: number): Promise<LoadedDataset> {
    const definition = this.datasets.find((dataset) => dataset.id === datasetId);
    if (!definition) throw new Error(`Unknown dataset: ${datasetId}`);

    const normalizedSamples = Math.max(1, Math.min(samples, definition.maxSamples));
    const data = await this.loadDatasetData(definition, normalizedSamples);

    return {
      definition,
      data,
    };
  }

  private async loadDatasetData(definition: DatasetDefinition, samples: number): Promise<TrainingData> {
    switch (definition.kind) {
      case 'mnist': {
        const [images, labels] = await Promise.all([
          this.loadMnistImages(definition.splitOffset, samples),
          this.loadMnistLabels(definition.splitOffset, samples),
        ]);
        return { x: images, y: labels };
      }
      case 'iris':
        return this.loadIris(definition.id === 'iris-test' ? IRIS_TEST_PATH : IRIS_TRAIN_PATH, samples);
      case 'boston-housing':
        return this.loadBostonHousing(
          definition.id === 'boston-housing-test' ? BOSTON_TEST_PATH : BOSTON_TRAIN_PATH,
          samples,
        );
    }
  }

  private async loadMnistImages(offset: number, samples: number): Promise<number[][]> {
    const image = await this.loadImage(MNIST_IMAGES_SPRITE_PATH);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D is not available in this browser.');

    canvas.width = image.naturalWidth;
    canvas.height = samples;
    context.drawImage(
      image,
      0,
      offset,
      image.naturalWidth,
      samples,
      0,
      0,
      image.naturalWidth,
      samples,
    );

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const rows: number[][] = Array.from({ length: samples }, () => new Array(MNIST_IMAGE_SIZE));

    for (let sampleIndex = 0; sampleIndex < samples; sampleIndex++) {
      const rowOffset = sampleIndex * MNIST_IMAGE_SIZE;
      for (let pixelIndex = 0; pixelIndex < MNIST_IMAGE_SIZE; pixelIndex++) {
        rows[sampleIndex][pixelIndex] = imageData[(rowOffset + pixelIndex) * 4] / 255;
      }
    }

    return rows;
  }

  private async loadMnistLabels(offset: number, samples: number): Promise<number[][]> {
    const response = await fetch(MNIST_LABELS_PATH);
    if (!response.ok) throw new Error(`Failed to load MNIST labels: ${response.status}`);

    const labels = new Uint8Array(await response.arrayBuffer());
    const rows: number[][] = [];

    for (let sampleIndex = 0; sampleIndex < samples; sampleIndex++) {
      const start = (offset + sampleIndex) * MNIST_CLASSES;
      rows.push(Array.from(labels.slice(start, start + MNIST_CLASSES)));
    }

    return rows;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image dataset: ${src}`));
      image.src = src;
    });
  }

  private async loadIris(path: string, samples: number): Promise<TrainingData> {
    const rows = (await this.fetchCsv(path)).slice(1, samples + 1);
    const x: number[][] = [];
    const y: number[][] = [];

    for (const row of rows) {
      const values = row.map(value => Number(value));
      x.push(values.slice(0, 4));
      y.push(this.oneHot(values[4], 3));
    }

    return { x, y };
  }

  private async loadBostonHousing(path: string, samples: number): Promise<TrainingData> {
    const rows = (await this.fetchCsv(path)).slice(1, samples + 1);
    const parsed = rows.map(row => row.map(value => Number(value)));
    const x = parsed.map(row => row.slice(0, -1));
    const y = parsed.map(row => [row[row.length - 1] / 50]);

    return { x: this.normalizeColumns(x), y };
  }

  private async fetchCsv(path: string): Promise<string[][]> {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load CSV dataset: ${response.status}`);

    const text = await response.text();
    return text
      .trim()
      .split('\n')
      .map(line => line.split(',').map(value => value.trim()));
  }

  private oneHot(classIndex: number, classes: number): number[] {
    return Array.from({ length: classes }, (_, index) => index === classIndex ? 1 : 0);
  }

  private normalizeColumns(rows: number[][]): number[][] {
    if (!rows.length) return rows;

    const columns = rows[0].length;
    const means = Array.from({ length: columns }, (_, column) =>
      rows.reduce((sum, row) => sum + row[column], 0) / rows.length,
    );
    const stds = means.map((mean, column) => {
      const variance = rows.reduce((sum, row) => sum + Math.pow(row[column] - mean, 2), 0) / rows.length;
      return Math.sqrt(variance) || 1;
    });

    return rows.map(row => row.map((value, column) => (value - means[column]) / stds[column]));
  }
}
