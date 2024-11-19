import {Text, View} from "react-native-ui-lib";
import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import {selectAppConfig} from "@/redux/configStore";
import {useTheme} from "@/theme";
import {EUICCPage} from "@/screens/Main/MainUI/EUICCPage";
import {useTranslation} from "react-i18next";
import {Dimensions, Linking, NativeModules, Platform, ScrollView, ToastAndroid} from "react-native";
import {Adapters} from "@/native/adapters/registry";
import TabController from "@/components/ui/tabController";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faDownload, faSimCard} from "@fortawesome/free-solid-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";

export default function SIMSelector() {
  const {colors} = useTheme();
  const {internalList} = useSelector((state: RootState) => state.LPA);
  const {nicknames} = useSelector(selectAppConfig);
  const {t} = useTranslation(['main']);
  const firstAvailable = internalList.map(x => Adapters[x].device.available).indexOf(true);
  const [index, setIndex] = useState(firstAvailable < 0 ? 0 : firstAvailable);
  const selected = index < internalList.length ? internalList[index] : null;
  const adapter = selected ? Adapters[selected] : null;
  console.log("Index", index);
  const width = Dimensions.get('window').width - 48;

  useEffect(() => {
    if (firstAvailable > 0 && !adapter.device.available) {
      setIndex(firstAvailable < 0 ? 0 : firstAvailable);
    }
  }, [firstAvailable]);

  if (width <= 0) return null;
  if (internalList.length == 0) return (
    <ScrollView
      bounces
      alwaysBounceVertical
      overScrollMode="always"
    >
      <View flex paddingT-20 gap-10>
        <Text color={colors.std200} center text70L>
          {t('main:no_device')}
        </Text>
        <Text color={colors.purple400} center underline text60L marginT-40 onPress={() => {
          Linking.openURL("https://lpa.nekoko.ee/products");
        }}>
          {t('main:purchase_note')}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View
      flexG-1
      flexS-0
    >
      <TabController
        items={
          internalList.map((name, _idx) => {

            const adapter = Adapters[name];
            return ({
              label:
                adapter.device.available ?
                  ((adapter.eid && nicknames[adapter.eid]) ? nicknames[adapter.eid] + ` (${adapter.device.deviceName})` : adapter.device.deviceName)
                : `${adapter.device.deviceName}\nunavailable`,
              icon: (
                <FontAwesomeIcon
                  icon={
                    adapter.device.deviceName.startsWith("SIM") ? faSimCard : faDownload
                  }
                  style={{
                    color: colors.std400,
                    marginRight: 4,
                    marginTop: -2,
                  }}
                  size={12}
                />
              ),
              labelStyle: {
                padding: 0,
                margin: 0,
                fontSize: 12,
                lineHeight: 16,
              },
              selectedLabelStyle: {
                padding: 0,
                margin: 0,
                fontSize: 12,
                lineHeight: 16,
                fontWeight: '500',
              },
              iconColor: colors.std400,
              labelColor: colors.std400,
              selectedLabelColor: colors.purple300,
              selectedIconColor: colors.purple300,
              width: width / internalList.length,
            })

          })
        }
        initialIndex={index}
        onChangeIndex={setIndex}
      >
        <TabController.TabBar
          backgroundColor={colors.cardBackground}
          activeBackgroundColor={colors.std600}
          labelColor={colors.purple300}
          indicatorWidth={width / internalList.length}
          faderProps={{
            tintColor: colors.std900,
          }}
          containerWidth={width}
          containerStyle={{
            width: '100%',
            overflow: "hidden",
            borderRadius: 20,
            marginBottom: 10,
            height: 40,
          }}
        />
      </TabController>
      {
        selected && (adapter != null) && (
          adapter.device.available ? (
            <EUICCPage deviceId={selected} key={selected}/>
          ): (
            <ScrollView
              bounces
              alwaysBounceVertical
              overScrollMode="always"
            >
              <View flex paddingT-20 gap-10>
                <Text color={colors.std200} center text70L>
                  {t('main:error_device')}
                </Text>
                <Text color={colors.red500} center text60L marginB-40>
                  {adapter.device.description}
                </Text>
                {
                  (Platform.OS === 'android' && adapter.device.signatures) && (
                    <>
                      <Text color={colors.std200} center text70L>
                        {t('main:android_aram')}
                      </Text>

                      <View flex paddingB-40 gap-10>
                        {adapter.device.signatures.split(",").map((s: string) => (
                          <Text color={colors.std200} text80L center key={s} onPress={() => {
                            ToastAndroid.show(`ARA-M ${s} Copied`, ToastAndroid.SHORT);
                            Clipboard.setString(s)
                          }}>{s}</Text>
                        ))}
                      </View>
                    </>
                  )
                }
                {
                  (Platform.OS === 'android') && (
                    <>
                      <Text color={colors.std200} center underline text60L marginT-40 onPress={() => {
                        const { OMAPIBridge } = NativeModules;
                        OMAPIBridge.openSTK(adapter.device.deviceName);
                      }}>
                        {t('main:open_stk_menu')}
                      </Text>
                    </>
                  )
                }
                <Text color={colors.purple400} center underline text60L marginT-40 onPress={() => {
                  Linking.openURL("https://lpa.nekoko.ee/products");
                }}>
                  {t('main:purchase_note')}
                </Text>
              </View>
            </ScrollView>
          )
        )
      }
    </View>
  )
}