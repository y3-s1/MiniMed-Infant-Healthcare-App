import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MidwifeProfile from '@/components/appointments/midwives/midwifeProfile';

const MidwifeProfileScreen = () => {
    const { midwifeId } = useLocalSearchParams();

    // Access the first element if midwifeId is an array
    const singleMidwifeId = Array.isArray(midwifeId) ? midwifeId[0] : midwifeId;

    return (
        <View>
          <ScrollView>
            <MidwifeProfile midwifeId={singleMidwifeId} />
          </ScrollView>
        </View>
    );
}

export default MidwifeProfileScreen;
