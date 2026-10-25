#!/usr/bin/env python3
"""Restore only audited course assets from the original archive; never infer links."""
import argparse, hashlib, json, zipfile
from pathlib import Path

def restore(archive, registry, scope, destination):
    raw=Path(archive).read_bytes()
    if hashlib.sha256(raw).hexdigest()!=registry['sourceZipSha256']:
        raise ValueError('Original course archive hash mismatch')
    if not registry['permission'].get('publicRepository'):
        raise ValueError('Course publication authorization missing')
    admitted={(x['src'],x['atlasId'],x['subjectTaxon'],x['caseId']) for x in scope['coursePhotoLinks']}
    atlas={u['id'] for u in scope['units']}
    with zipfile.ZipFile(archive) as z:
        for asset in registry['images']:
            if not asset['src'].startswith('images/course-chat/micolab-') or Path(asset['src']).name!=f"micolab-{asset['photoMessageId']}.jpg":
                raise ValueError('Unexpected destination')
            for link in asset['links']:
                image=link['image']
                if link['atlasId'] not in atlas or (asset['src'],link['atlasId'],image['subjectTaxon'],image['caseId']) not in admitted:
                    raise ValueError('Course subject outside reviewed curriculum scope')
            image=z.read(asset['sourceFilename'])
            if hashlib.sha256(image).hexdigest()!=asset['sourceSha256']:
                raise ValueError('Course source photograph hash mismatch')
            end=image.rfind(b'\xff\xd9')
            if end<0: raise ValueError('Missing JPEG end marker')
            image=image[:end+2] # Remove trailing WhatsApp/SEFT metadata without recompression.
            if hashlib.sha256(image).hexdigest()!=asset['fileSha256']:
                raise ValueError('Audited publication photograph hash mismatch')
            out=Path(destination)/asset['src'];out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(image)
    print(f"Restored {len(registry['images'])} audited photographs")

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--archive',required=True);p.add_argument('--registry',default='src/data/course-chat-images.json');p.add_argument('--scope',default='src/data/curriculum-scope.json');p.add_argument('--destination',default='web/public');a=p.parse_args()
    restore(a.archive,json.loads(Path(a.registry).read_text()),json.loads(Path(a.scope).read_text()),a.destination)
