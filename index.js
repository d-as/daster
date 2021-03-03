const fileSelect = document.getElementById('file-select');
const fileInput = document.getElementById('input-file');
const pixelDensitySlider = document.getElementById('input-density-slider');
const pixelDensityInput = document.getElementById('input-density');
const rasterizeButton = document.getElementById('button-rasterize');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const errorContainer = document.getElementById('error');
const loading = document.getElementById('loading');
const densityButtons = document.getElementById('density-buttons');

fileInput.focus();

let imageFile;
const pixelDensityMax = 1000;

const showError = message => {
  errorContainer.innerText = message;
};

const fileHandler = ({ target }) => {
  const [file] = target.files;

  if (file?.type.startsWith('image')) {
    imageFile = file;
    rasterizeButton.disabled = false;
    showError('');
  } else {
    rasterizeButton.disabled = true;
    showError(`Invalid file: ${file?.name ?? '?'}`);
  }
};

const updatePixelDensity = ({ target }) => {
  let { value } = target;

  if (value === '') {
    return;
  }
  value = Number(value);

  if (Number.isNaN(value) || value < 1) {
    value = 1;
  } else if (value > pixelDensityMax) {
    value = pixelDensityMax;
  }

  pixelDensitySlider.value = value;
  pixelDensityInput.value = value;
};

const blurPixelDensity = ({ target }) => {
  if (target.value === '') {
    target.value = pixelDensitySlider.value;
  }
};

const getPixel = (width, x, y) => (
  ((y * width) + x) * 4
);

const range = size => (
  [...Array(size).keys()]
);

const transformImage = (data, pixelDensity, tilesX, tilesY) => {
  const { width } = canvas;

  // TODO: Allow labeling tiles with order numbers and colour numbers
  // TODO: Add colour key and allow limiting number of colours used

  for (let tileX = 0; tileX < tilesX; tileX++) {
    for (let tileY = 0; tileY < tilesY; tileY++) {
      const pixelSums = [0, 0, 0];
      const tilePositionX = tileX * pixelDensity;
      const tilePositionY = tileY * pixelDensity;
      let pixelCount = 0;

      for (let x = 0; x < pixelDensity; x++) {
        for (let y = 0; y < pixelDensity; y++) {
          const pixel = getPixel(
            width,
            x + tilePositionX,
            y + tilePositionY,
          );

          const [r, g, b] = data.slice(pixel, pixel + 3);
          [r, g, b].forEach((value, i) => pixelSums[i] += value);
          pixelCount++;
        }
      }

      const averages = pixelSums.map(value => Math.round(value / pixelCount));

      for (let x = 0; x < pixelDensity; x++) {
        for (let y = 0; y < pixelDensity; y++) {
          const pixel = getPixel(
            width,
            x + tilePositionX,
            y + tilePositionY,
          );

          range(3).forEach(i => data[pixel + i] = averages[i]);
        }
      }
    }
  }
  return data;
};

const rasterize = () => {
  fileSelect.classList.add('hidden');
  canvas.classList.remove('hidden');
  loading.innerText = 'Loading';

  if (imageFile) {
    const image = new Image();

    image.onload = () => {
      const { width, height } = image;
      const pixelDensity = Number(pixelDensitySlider.value);
      const tilesX = Math.ceil(width / pixelDensity);
      const tilesY = Math.ceil(height / pixelDensity);

      canvas.width = tilesX * pixelDensity;
      canvas.height = tilesY * pixelDensity;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      imageData.data = transformImage(imageData.data, pixelDensity, tilesX, tilesY);
      context.putImageData(imageData, 0, 0);
      loading.innerText = '';
    };

    image.src = URL.createObjectURL(imageFile);
  } else {
    throw new Error('No image file');
  }
};

const keyHandler = event => {
  const { key } = event;

  if (key === 'Enter') {
    if (rasterizeButton.disabled) {
      fileInput.focus();
    } else {
      event.preventDefault();
      rasterize();
    }
  } else if (
    document.activeElement !== pixelDensityInput
    && ['ArrowLeft', 'ArrowRight'].includes(key)
  ) {
    if (document.activeElement !== pixelDensitySlider) {
      const offset = key === 'ArrowLeft' ? -1 : 1;
      updatePixelDensity({ target: { value: Number(pixelDensitySlider.value) + offset } });
    }

    pixelDensitySlider.focus();
  }
};

fileInput.addEventListener('change', fileHandler);
pixelDensitySlider.addEventListener('input', updatePixelDensity);
pixelDensityInput.addEventListener('input', updatePixelDensity);
pixelDensityInput.addEventListener('blur', blurPixelDensity);
rasterizeButton.addEventListener('click', rasterize);
window.addEventListener('keydown', keyHandler);

densityButtons.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    updatePixelDensity({ target: { value: Number(button.innerText) } });
  });
});
