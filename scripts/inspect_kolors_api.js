import fs from 'fs';

async function inspect() {
  try {
    const res = await fetch('https://kwai-kolors-kolors-virtual-try-on.hf.space/config');
    console.log('Status /config:', res.status);
    if (!res.ok) {
      console.log('Failed:', res.statusText);
      return;
    }
    const data = await res.json();
    console.log('Gradio version:', data.version);
    console.log('Dependencies count:', data.dependencies ? data.dependencies.length : 0);
    if (data.dependencies) {
      data.dependencies.forEach((d, idx) => {
        console.log(`Dep ${idx}: api_name=${d.api_name}, inputs=${JSON.stringify(d.inputs)}, outputs=${JSON.stringify(d.outputs)}`);
      });
    }
    if (data.components) {
      const relevant = data.components.map(c => ({
        id: c.id,
        type: c.type,
        label: c.props?.label,
        value: c.props?.value ? (typeof c.props.value === 'string' ? c.props.value.slice(0, 30) : typeof c.props.value) : undefined
      }));
      console.log('Components:', JSON.stringify(relevant, null, 2));
    }
  } catch (e) {
    console.log('Error inspecting space:', e.message);
  }
}

inspect();
