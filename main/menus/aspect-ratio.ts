import {Menu} from 'electron';
import {MenuOptions} from './utils';

// The cropper builds this menu here with one `remote` call. Building it in the renderer needed a synchronous `remote` call for each item.
export const buildAspectRatioMenu = ({ratio, ratios, setRatio}: {ratio: number[]; ratios: string[]; setRatio: (ratio: number[]) => void}) => {
  const selectedRatio = ratio.join(':');

  const template: MenuOptions = ratios.map(r => ({
    label: r,
    type: 'radio',
    checked: r === selectedRatio,
    click: () => {
      setRatio(r.split(':').map(d => Number.parseInt(d, 10)));
    }
  }));

  template.push(ratios.includes(selectedRatio) ? {
    label: 'Custom',
    type: 'radio',
    checked: false,
    enabled: false
  } : {
    label: `Custom ${selectedRatio}`,
    type: 'radio',
    checked: true
  });

  return Menu.buildFromTemplate(template);
};
