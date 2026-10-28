"""Navigation regressions: tall photo cases and real scroll-container bounds."""
import importlib.util,unittest,xml.etree.ElementTree as ET
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('beta_smoke',Path(__file__).with_name('android-beta-smoke.py'))
beta=importlib.util.module_from_spec(spec);spec.loader.exec_module(beta)
class Screen:
 def __init__(self,last,target,start=0):self.page=start;self.last=last;self.target=target;self.now=0;self.swipes=[];self.taps=[]
 def time(self):return self.now
 def monotonic(self):return self.now
 def sleep(self,n):self.now+=n
 def dump(self):
  self.now+=5
  root=ET.Element('hierarchy')
  ET.SubElement(root,'node',{'text':'Fixed header','bounds':'[0,340][720,475]'})
  sc=ET.SubElement(root,'node',{'class':'android.widget.ScrollView','scrollable':'true','bounds':'[0,502][720,1070]'})
  ET.SubElement(sc,'node',{'text':'page '+str(self.page),'bounds':'[20,520][700,600]'})
  if self.page==self.target:ET.SubElement(sc,'node',{'text':'Target','clickable':'true','bounds':'[20,700][700,800]','enabled':'true'})
  return root
 def adb(self,*args):
  if args==('shell','wm','size'):return 'Physical size: 720x1280'
  if args[:3]==('shell','input','swipe'):
   x,y,x2,y2=map(int,args[3:7]);self.swipes.append((x,y,x2,y2));self.page=max(0,min(self.last,self.page+(1 if y>y2 else -1)))
  if args[:3]==('shell','input','tap'):self.taps.append(tuple(map(int,args[3:5])))
  return ''
 def invoke(self,fn,*args):
  env=fn.__globals__
  with patch.dict(env,{'adb':self.adb,'dump':self.dump,'time':self}):return fn(*args)
class Navigation(unittest.TestCase):
 def test_wait_reaches_input_after_many_photo_viewports(self):
  s=Screen(12,10);root=s.invoke(beta.wait_text,'Target');self.assertIn('Target',beta.text_of(root))
 def test_tap_reaches_control_after_more_than_seven_viewports(self):
  s=Screen(12,10);s.invoke(beta.tap,'Target');self.assertEqual(s.taps,[(360,750)])
 def test_swipes_stay_inside_scroll_body_below_fixed_tabs(self):
  s=Screen(3,2);s.invoke(beta.tap,'Target');self.assertTrue(s.swipes)
  for x,y,x2,y2 in s.swipes:self.assertTrue(502<y<1070 and 502<y2<1070,(x,y,x2,y2))
 def test_search_can_return_to_control_above_existing_scroll_offset(self):
  s=Screen(5,1,start=4);s.invoke(beta.tap,'Target');self.assertEqual(s.taps,[(360,750)])
 def test_missing_control_still_fails(self):
  s=Screen(1,10)
  with self.assertRaises(AssertionError):s.invoke(beta.wait_text,'Missing',15)
if __name__=='__main__':unittest.main()
