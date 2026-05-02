from rest_framework import serializers
from .models import Challenge, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['test_id', 'input_data', 'expected_output', 'hidden_flag']

class ChallengeSerializer(serializers.ModelSerializer):
    test_cases = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Challenge
        fields = [
            'challenge_id', 'title', 'description', 'starter_code', 
            'difficulty', 'language', 'creator_username', 'test_cases'
        ]

    def get_test_cases(self, obj):
        # SECURITY: Only return visible test cases to the client unless the user is the creator
        request = self.context.get('request')
        if request and request.user == obj.creator:
            cases = obj.test_cases.all()
        else:
            cases = obj.test_cases.filter(hidden_flag=False)
        return TestCaseSerializer(cases, many=True).data
    def update(self, instance, validated_data):
        # 1. Pop the test cases array out
        test_cases_data = validated_data.pop('test_cases', None)

        # 2. Update the main Challenge fields (title, description, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 3. If test cases were sent, replace the old ones with the new ones
        if test_cases_data is not None:
            instance.test_cases.all().delete() # Clear old ones
            for tc_data in test_cases_data:
                TestCase.objects.create(challenge=instance, **tc_data)

        return instance

class ChallengeDetailSerializer(ChallengeSerializer):
    # Includes the solution code, but we'll restrict when this serializer is used
    class Meta(ChallengeSerializer.Meta):
        fields = ChallengeSerializer.Meta.fields + ['solution_code']